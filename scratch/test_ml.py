import urllib.request
import json

data = json.dumps({
    "students": [
        {
            "usn": "test",
            "attendance": 80,
            "ia1": 15,
            "ia2": 15,
            "ia3": 15,
            "practical": 10,
            "cgpa": 8.0
        }
    ]
}).encode('utf-8')

req = urllib.request.Request('http://127.0.0.1:5000/predict', data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
