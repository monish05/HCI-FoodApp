import requests

base_url = "http://localhost:8000"

# 1. Login or Register
res = requests.post(f"{base_url}/api/auth/register", json={
    "email": "test456@test.com",
    "password": "password",
    "name": "Test User"
})

if res.status_code != 200 and "already registered" not in res.text:
    print("Reg failed:", res.text)

res = requests.post(f"{base_url}/api/auth/login", json={
    "email": "test456@test.com",
    "password": "password"
})
token = res.json().get("access_token")

# 2. Add to fridge
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "items": [
        {"name": "Milk", "amount": 2, "unit": "count", "category": "Dairy", "daysLeft": 7}
    ]
}

res = requests.post(f"{base_url}/api/fridge/add", json=payload, headers=headers)
print("Add Resp:", res.status_code, res.text)
