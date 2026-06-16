import requests
import json

data = {
    "students": [
        {
            "usn": "1RN21CS001",
            "attendance": 80,
            "ia1": 25,
            "ia2": 24,
            "ia3": 26,
            "practical": 18
        }
    ]
}

try:
    resp = requests.post("http://127.0.0.1:5000/predict", json=data)
    print("Status:", resp.status_code)
    print(resp.text)
except Exception as e:
    print(e)
