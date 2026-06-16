import json
from app import app

client = app.test_client()

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

response = client.post('/predict', json=data)
print("Status:", response.status_code)
print(response.get_data(as_text=True))
