import requests

url = "http://localhost:8000/api/auth/login/"
payloads = [
    {"email": "farmer01@gmail.com", "password": "password"},
    {"email": "transporter01@gmail.com", "password": "password"},
    {"email": "distributor01@gmail.com", "password": "password"},
    {"email": "retailer01@gmail.com", "password": "password"},
    # Also test by username
    {"email": "transporter01", "password": "password"},
]

for payload in payloads:
    print(f"Testing login for: {payload['email']}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)
