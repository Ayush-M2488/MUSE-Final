import requests

token = None

# 1. Login to get token
resp = requests.post('http://127.0.0.1:3000/api/auth/login', json={
    "email": "sarah.w@university.edu",
    "password": "hashed_password_4"
})
if resp.status_code == 200:
    token = resp.json().get('token')
    print("Logged in")
else:
    print("Login failed", resp.text)

if token:
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "usn": "1MUSE20CS001",
        "status": "present",
        "date": "2026-06-01"
    }
    r = requests.post('http://127.0.0.1:3000/api/teacher/courses/CSE801/attendance', json=payload, headers=headers)
    print("Response:", r.status_code, r.text)
