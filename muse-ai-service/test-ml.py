import requests

data = {
    "students": [
        {
            "usn": "1MS21CI001",
            "attendance": 80,
            "ia1": 15,
            "ia2": 15,
            "ia3": 15,
            "practical": 30,
            "cgpa": 8.5
        }
    ]
}

res = requests.post("http://localhost:5000/predict", json=data)
print(res.status_code)
print(res.text)
