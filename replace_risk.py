import os

def replace_in_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. UI Text Mapping for Risk Levels
    content = content.replace("risk score significantly", "forecast significantly")
    content = content.replace("risk score from going", "forecast from dropping")
    content = content.replace("increase the risk score", "push toward risk")
    content = content.replace("decrease the risk score", "protect the standing")
    content = content.replace("your specific risk score", "your specific AI forecast")
    content = content.replace("a specific risk score", "a specific AI forecast")
    content = content.replace("Risk Score {riskSortKey", "Forecast Confidence {riskSortKey")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src/components/dashboard'):
    for file in files:
        if file.endswith('.jsx'):
            replace_in_file(os.path.join(root, file))
