import os
import uuid
import struct
import wave
import io
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://critter-chat-app.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_url():
    return API


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_user():
    email = f"TEST_tester+{uuid.uuid4().hex[:8]}@talktome.app"
    return {"email": email, "password": "test1234"}


@pytest.fixture(scope="session")
def auth_token(api_client, test_user):
    r = api_client.post(f"{API}/auth/signup", json=test_user, timeout=15)
    assert r.status_code == 201, f"signup failed: {r.status_code} {r.text}"
    tok = r.json().get("access_token")
    assert tok, "no access_token returned"
    return tok


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="session")
def small_wav_bytes():
    """Generate ~0.5s of near-silence 16kHz mono WAV bytes."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)  # 16-bit
        w.setframerate(16000)
        frames = 8000  # 0.5 seconds
        # a low tone would be more useful than pure silence for whisper
        import math
        samples = bytearray()
        for i in range(frames):
            v = int(1000 * math.sin(2 * math.pi * 440 * i / 16000))
            samples += struct.pack("<h", v)
        w.writeframes(bytes(samples))
    return buf.getvalue()
