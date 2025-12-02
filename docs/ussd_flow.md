# USSD Flow (placeholder)

Basic USSD menu skeleton for Reacher:

1. Welcome: "Welcome to Reacher - 1: Search 2: Create Account"
2. Search: Enter town/city or use stored location
3. List categories or keyword search
4. Select provider from list (numbered), show phone/contact

USSD server should map incoming sessions to a temporary session store (Redis) and translate menu selections into API calls to the backend.
