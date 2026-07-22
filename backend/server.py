"""Talk To Me backend — auth (JWT), chat (Groq LLM), STT (Groq Whisper),
persistence for streaks / coins / owned items / equipped cosmetics."""
import json
import logging
import os
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

import bcrypt
import requests
from authlib.integrations.base_client import OAuthError
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

# --- Config ---
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXP_DAYS = int(os.environ.get("JWT_EXPIRE_DAYS", "7"))
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_ANDROID_CLIENT_ID = os.environ.get("GOOGLE_ANDROID_CLIENT_ID", "")
GOOGLE_IOS_CLIENT_ID = os.environ.get("GOOGLE_IOS_CLIENT_ID", "")

# --- Groq client (lazy so backend still boots if key missing) ---
from groq import Groq  # noqa: E402
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# --- Mongo ---
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

# --- App ---
app = FastAPI(title="Talk To Me API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("talk-to-me")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ============================ MODELS ============================
class SignupBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoogleAuthBody(BaseModel):
    id_token: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime
    coins: int
    gems: int
    streak: int
    level: str
    language: str
    owned_items: List[str]
    equipped: Dict[str, Optional[str]]


class UpdateStateBody(BaseModel):
    coins: Optional[int] = None
    gems: Optional[int] = None
    streak: Optional[int] = None
    level: Optional[str] = None
    language: Optional[str] = None
    owned_items: Optional[List[str]] = None
    equipped: Optional[Dict[str, Optional[str]]] = None
    delta_coins: Optional[int] = None
    delta_streak: Optional[int] = None


class HistoryMsg(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatBody(BaseModel):
    user_message: str
    character_name: str = "Luna"
    character_vibe: str = "warm patient teahouse buddy who loves tea"
    target_language: str = "Spanish"
    level: str = "A2"
    history: List[HistoryMsg] = []


class Correction(BaseModel):
    wrong: str
    right: str
    hint: str


class ChatResp(BaseModel):
    reply: str
    correction: Optional[Correction] = None


# ============================ AUTH UTILS ============================
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        uid = payload.get("sub")
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = await db.users.find_one({"id": uid}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def user_to_out(u: Dict[str, Any]) -> UserOut:
    return UserOut(
        id=u["id"], email=u["email"], created_at=u["created_at"],
        coins=u.get("coins", 240), gems=u.get("gems", 16),
        streak=u.get("streak", 0), level=u.get("level", "A2"),
        language=u.get("language", "Spanish"),
        owned_items=u.get("owned_items", ["i3", "i7"]),
        equipped=u.get("equipped", {"outfit": "i3", "room": None, "prop": None, "frame": None}),
    )


# ============================ AUTH ROUTES ============================
@api.post("/auth/signup", response_model=TokenResp, status_code=201)
async def signup(body: SignupBody):
    logger.info(f"Signup attempt for email: {body.email}")
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    import uuid
    uid = str(uuid.uuid4())
    user = {
        "id": uid, "email": body.email, "password": hash_pw(body.password),
        "created_at": datetime.now(timezone.utc),
        "coins": 240, "gems": 16, "streak": 0,
        "level": "A2", "language": "Spanish",
        "owned_items": ["i3", "i7"],
        "equipped": {"outfit": "i3", "room": None, "prop": None, "frame": None},
    }
    await db.users.insert_one(user)
    logger.info(f"User created successfully: {uid}")
    return TokenResp(access_token=make_token(uid))


@api.post("/auth/login", response_model=TokenResp)
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_pw(body.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")
    return TokenResp(access_token=make_token(user["id"]))


@api.get("/auth/me", response_model=UserOut)
async def me(u=Depends(current_user)):
    return user_to_out(u)


@api.post("/auth/google", response_model=TokenResp)
async def google_auth(body: GoogleAuthBody):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Google OAuth not configured")

    # Verify Google ID token
    try:
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={body.id_token}"
        )
        if response.status_code != 200:
            logger.error(f"Google token verification failed: {response.text}")
            raise HTTPException(401, "Invalid Google token")
        token_info = response.json()

        # Verify the token is for our app (accept web, android, or ios client IDs)
        valid_auds = [GOOGLE_CLIENT_ID]
        if GOOGLE_ANDROID_CLIENT_ID:
            valid_auds.append(GOOGLE_ANDROID_CLIENT_ID)
        if GOOGLE_IOS_CLIENT_ID:
            valid_auds.append(GOOGLE_IOS_CLIENT_ID)

        if token_info.get("aud") not in valid_auds:
            logger.error(f"Token audience mismatch: expected one of {valid_auds}, got {token_info.get('aud')}")
            raise HTTPException(401, "Token audience mismatch")

        email = token_info.get("email")
        if not email:
            raise HTTPException(401, "No email in token")

    except requests.RequestException as e:
        logger.exception("Google token verification error")
        raise HTTPException(502, f"Google verification failed: {e}")
    
    # Find or create user
    user = await db.users.find_one({"email": email})
    if not user:
        import uuid
        uid = str(uuid.uuid4())
        user = {
            "id": uid,
            "email": email,
            "password": "",  # OAuth users have no password
            "created_at": datetime.now(timezone.utc),
            "coins": 240,
            "gems": 16,
            "streak": 0,
            "level": "A2",
            "language": "Spanish",
            "owned_items": ["i3", "i7"],
            "equipped": {"outfit": "i3", "room": None, "prop": None, "frame": None},
        }
        await db.users.insert_one(user)
    
    return TokenResp(access_token=make_token(user["id"]))


@api.patch("/auth/state", response_model=UserOut)
async def update_state(body: UpdateStateBody, u=Depends(current_user)):
    set_ops: Dict[str, Any] = {}
    inc_ops: Dict[str, Any] = {}
    for field in ("coins", "gems", "streak", "level", "language", "owned_items", "equipped"):
        val = getattr(body, field)
        if val is not None:
            set_ops[field] = val
    if body.delta_coins:
        inc_ops["coins"] = body.delta_coins
    if body.delta_streak:
        inc_ops["streak"] = body.delta_streak

    update: Dict[str, Any] = {}
    if set_ops:
        update["$set"] = set_ops
    if inc_ops:
        update["$inc"] = inc_ops
    if update:
        await db.users.update_one({"id": u["id"]}, update)
    fresh = await db.users.find_one({"id": u["id"]}, {"_id": 0, "password": 0})
    return user_to_out(fresh)


# ============================ CHAT ROUTES ============================
def _system_prompt(char: str, vibe: str, target_lang: str, level: str) -> str:
    return (
        f"You are {char}, a cute anime character in the Talk To Me language "
        f"practice app. Vibe: {vibe}. You are chatting with a teenage girl "
        f"learning {target_lang} at CEFR level {level}. "
        f"Reply IN {target_lang} using vocabulary and grammar appropriate for "
        f"{level}. Keep replies short (1-2 sentences), warm, playful, "
        f"encouraging. Use emojis sparingly. Ask a follow-up question. "
        f"If the user mixes English words into a {target_lang} sentence, "
        f"produce a 'language police' correction. Reply STRICTLY as pure JSON "
        f"matching this schema, no other text, no markdown:\n"
        f'{{"reply": "<{char}\'s reply in {target_lang}>", '
        f'"correction": null OR {{"wrong": "<user\'s mixed sentence>", '
        f'"right": "<full sentence in {target_lang}>", '
        f'"hint": "<short English hint>"}}}}'
    )


@api.post("/chat/message", response_model=ChatResp)
async def chat_message(body: ChatBody, u=Depends(current_user)):
    if not groq_client:
        raise HTTPException(503, "Groq not configured")
    sys_msg = _system_prompt(body.character_name, body.character_vibe, body.target_language, body.level)
    messages: List[Dict[str, str]] = [{"role": "system", "content": sys_msg}]
    for m in body.history[-8:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": body.user_message})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=300,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content or "{}"
    except Exception as e:
        logger.exception("groq chat error")
        raise HTTPException(502, f"Groq error: {e}")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # fallback: treat whole response as reply
        parsed = {"reply": raw, "correction": None}

    reply = parsed.get("reply") or "..."
    corr_raw = parsed.get("correction")
    corr = None
    if isinstance(corr_raw, dict) and corr_raw.get("wrong") and corr_raw.get("right"):
        corr = Correction(
            wrong=corr_raw.get("wrong", ""),
            right=corr_raw.get("right", ""),
            hint=corr_raw.get("hint", ""),
        )
    return ChatResp(reply=reply, correction=corr)


@api.post("/chat/transcribe")
async def transcribe(file: UploadFile = File(...), u=Depends(current_user)):
    if not groq_client:
        raise HTTPException(503, "Groq not configured")
    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Empty audio file")
    # Determine extension
    ext = "webm"
    if file.content_type:
        if "m4a" in file.content_type or "mp4" in file.content_type:
            ext = "m4a"
        elif "wav" in file.content_type:
            ext = "wav"
        elif "mpeg" in file.content_type or "mp3" in file.content_type:
            ext = "mp3"
        elif "ogg" in file.content_type:
            ext = "ogg"

    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as af:
            tr = groq_client.audio.transcriptions.create(
                file=(f"speech.{ext}", af.read()),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
                temperature=0.0,
            )
        text = getattr(tr, "text", None) or ""
        language = getattr(tr, "language", None)
        return {"text": text, "language": language}
    except Exception as e:
        logger.exception("groq transcribe error")
        raise HTTPException(502, f"Whisper error: {e}")
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@api.get("/")
async def root():
    return {"app": "talk-to-me", "ok": True, "groq": bool(groq_client)}


app.include_router(api)


@app.on_event("shutdown")
async def _shutdown():
    client.close()
