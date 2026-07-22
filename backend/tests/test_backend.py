"""Backend tests for Talk To Me: health, auth, chat (Groq LLM), transcribe (Groq Whisper)."""
import requests


# ---------- Health ----------
class TestHealth:
    def test_root_ok_and_groq(self, api_url):
        r = requests.get(f"{api_url}/", timeout=10)
        assert r.status_code == 200
        j = r.json()
        assert j.get("ok") is True
        assert j.get("groq") is True, "Groq is not configured on backend"


# ---------- Auth ----------
class TestAuth:
    def test_signup_returns_jwt(self, auth_token):
        # fixture already did signup; token must be non-empty string
        assert isinstance(auth_token, str) and len(auth_token) > 20

    def test_login_returns_jwt(self, api_client, api_url, test_user):
        r = api_client.post(f"{api_url}/auth/login", json=test_user, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("access_token")

    def test_login_wrong_password(self, api_client, api_url, test_user):
        r = api_client.post(f"{api_url}/auth/login",
                            json={"email": test_user["email"], "password": "wrongwrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_returns_user_with_token(self, api_url, auth_headers, test_user):
        r = requests.get(f"{api_url}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        u = r.json()
        assert u.get("email") == test_user["email"]
        # Starting balance per PRD/backend defaults
        assert isinstance(u.get("coins"), int)
        assert isinstance(u.get("gems"), int)
        assert "equipped" in u and "owned_items" in u

    def test_me_requires_auth(self, api_url):
        r = requests.get(f"{api_url}/auth/me", timeout=10)
        assert r.status_code == 401


# ---------- Chat (Groq LLM) ----------
class TestChat:
    def test_chat_message_requires_auth(self, api_url):
        r = requests.post(f"{api_url}/chat/message",
                          json={"user_message": "hi"}, timeout=15)
        assert r.status_code == 401

    def test_chat_message_returns_reply(self, api_url, auth_headers):
        body = {
            "user_message": "Hola! Cómo estás?",
            "character_name": "Luna",
            "character_vibe": "warm teahouse buddy",
            "target_language": "Spanish",
            "level": "A2",
            "history": [],
        }
        r = requests.post(f"{api_url}/chat/message", json=body,
                          headers=auth_headers, timeout=45)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "reply" in j
        assert isinstance(j["reply"], str) and len(j["reply"].strip()) > 0
        # correction is optional (None allowed)
        assert "correction" in j


# ---------- Transcribe (Groq Whisper) ----------
class TestTranscribe:
    def test_transcribe_requires_auth(self, api_url, small_wav_bytes):
        files = {"file": ("speech.wav", small_wav_bytes, "audio/wav")}
        r = requests.post(f"{api_url}/chat/transcribe", files=files, timeout=30)
        assert r.status_code == 401

    def test_transcribe_returns_json_shape(self, api_url, auth_token, small_wav_bytes):
        # Use bearer header without Content-Type (multipart)
        headers = {"Authorization": f"Bearer {auth_token}"}
        files = {"file": ("speech.wav", small_wav_bytes, "audio/wav")}
        r = requests.post(f"{api_url}/chat/transcribe", headers=headers,
                          files=files, timeout=60)
        assert r.status_code != 503, "Groq not configured (503 returned)"
        assert r.status_code == 200, r.text
        j = r.json()
        assert "text" in j
        assert "language" in j
        assert isinstance(j["text"], str)
