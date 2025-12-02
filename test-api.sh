#!/bin/bash
# Reacher API Integration Test Script
# This script tests all major API endpoints

API_BASE="http://localhost:4000/api"
TEST_PHONE="+254712345001"
TEST_PASSWORD="password"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Reacher Backend API Integration Tests${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# Test 1: Login
echo -e "${YELLOW}[1] Testing Authentication (Login)...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)
USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.user.name' 2>/dev/null)

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "  User: $USER_NAME"
  echo "  Token: ${TOKEN:0:30}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "  Response: $LOGIN_RESPONSE"
  exit 1
fi

echo ""

# Test 2: Get Current Profile
echo -e "${YELLOW}[2] Testing Get Current Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/profiles/me/current" \
  -H "Authorization: Bearer $TOKEN")

PROFILE_TYPE=$(echo $PROFILE_RESPONSE | jq -r '.profile.profile_type' 2>/dev/null)

if [ "$PROFILE_TYPE" = "consumer" ]; then
  echo -e "${GREEN}✓ Current profile retrieved${NC}"
  echo "  Profile Type: $PROFILE_TYPE"
else
  echo -e "${RED}✗ Failed to get profile${NC}"
fi

echo ""

# Test 3: Get All Profiles
echo -e "${YELLOW}[3] Testing Get All User Profiles...${NC}"
ALL_PROFILES=$(curl -s -X GET "$API_BASE/profiles/me/all" \
  -H "Authorization: Bearer $TOKEN")

PROFILES_COUNT=$(echo $ALL_PROFILES | jq '.profiles | length' 2>/dev/null)

if [ "$PROFILES_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ All profiles retrieved${NC}"
  echo "  Number of profiles: $PROFILES_COUNT"
else
  echo -e "${RED}✗ Failed to get profiles${NC}"
fi

echo ""

# Test 4: Get Products
echo -e "${YELLOW}[4] Testing Get Products...${NC}"
PRODUCTS=$(curl -s -X GET "$API_BASE/products")

PRODUCT_COUNT=$(echo $PRODUCTS | jq '.products | length' 2>/dev/null)

if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Products retrieved${NC}"
  echo "  Number of products: $PRODUCT_COUNT"
  FIRST_PRODUCT=$(echo $PRODUCTS | jq -r '.products[0].title' 2>/dev/null)
  echo "  First product: $FIRST_PRODUCT"
else
  echo -e "${RED}✗ Failed to get products${NC}"
fi

echo ""

# Test 5: Get Services
echo -e "${YELLOW}[5] Testing Get Services...${NC}"
SERVICES=$(curl -s -X GET "$API_BASE/services")

SERVICE_COUNT=$(echo $SERVICES | jq '.services | length' 2>/dev/null)

if [ "$SERVICE_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Services retrieved${NC}"
  echo "  Number of services: $SERVICE_COUNT"
  FIRST_SERVICE=$(echo $SERVICES | jq -r '.services[0].name' 2>/dev/null)
  echo "  First service: $FIRST_SERVICE"
else
  echo -e "${RED}✗ Failed to get services${NC}"
fi

echo ""

# Test 6: Switch Profile Mode
echo -e "${YELLOW}[6] Testing Profile Mode Switch...${NC}"
SWITCH_RESPONSE=$(curl -s -X POST "$API_BASE/profiles/switch-mode" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_mode":"seller"}')

CURRENT_MODE=$(echo $SWITCH_RESPONSE | jq -r '.current_mode' 2>/dev/null)

if [ "$CURRENT_MODE" = "seller" ]; then
  echo -e "${GREEN}✓ Profile mode switched successfully${NC}"
  echo "  New mode: $CURRENT_MODE"
else
  echo -e "${RED}✗ Failed to switch profile mode${NC}"
fi

echo ""

# Test 7: Get Nearby Profiles
echo -e "${YELLOW}[7] Testing Nearby Profiles Search...${NC}"
NEARBY=$(curl -s -X GET "$API_BASE/profiles/nearby?latitude=-1.2921&longitude=36.8219&radius_km=10" \
  -H "Authorization: Bearer $TOKEN")

NEARBY_COUNT=$(echo $NEARBY | jq '.profiles | length' 2>/dev/null)

if [ "$NEARBY_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Nearby profiles found${NC}"
  echo "  Number of nearby profiles: $NEARBY_COUNT"
else
  echo -e "${YELLOW}⚠ No nearby profiles found (may be expected)${NC}"
fi

echo ""

# Test 8: Get Reviews
echo -e "${YELLOW}[8] Testing Get Reviews...${NC}"
REVIEWS=$(curl -s -X GET "$API_BASE/reviews")

REVIEW_COUNT=$(echo $REVIEWS | jq '.reviews | length' 2>/dev/null)

if [ "$REVIEW_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Reviews retrieved${NC}"
  echo "  Number of reviews: $REVIEW_COUNT"
else
  echo -e "${YELLOW}⚠ No reviews found${NC}"
fi

echo ""

# Test 9: Error Handling - Missing Token
echo -e "${YELLOW}[9] Testing Error Handling (Missing Token)...${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/profiles/me/current")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected request without token${NC}"
  echo "  HTTP Status: 401 Unauthorized"
else
  echo -e "${RED}✗ Should return 401 for missing token${NC}"
fi

echo ""

# Test 10: Error Handling - Invalid Credentials
echo -e "${YELLOW}[10] Testing Error Handling (Invalid Credentials)...${NC}"
INVALID_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+999999999999","password":"wrongpass"}')

INVALID_CODE=$(echo "$INVALID_LOGIN" | tail -n 1)

if [ "$INVALID_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid credentials${NC}"
  echo "  HTTP Status: 401 Unauthorized"
else
  echo -e "${RED}✗ Should return 401 for invalid credentials${NC}"
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}API Integration Tests Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
