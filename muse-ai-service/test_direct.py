import sys
import os

# Append current directory to path
sys.path.append(os.path.dirname(__file__))

import app
# Force fallback mode!
app.loaded_model = None
app.explainer = None

# Create a test client
client = app.app.test_client()

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

response = client.post('/predict', json=data)
print("STATUS:", response.status_code)
print("BODY:", response.get_data(as_text=True))
