# Fleet Management API - Complete Testing Guide

## Testing Overview

This guide provides comprehensive testing strategies for all v1 API endpoints using both curl commands and Postman collection structure. All tests are designed to validate authentication, authorization, input validation, and response consistency.

## Base Configuration

**Base URL:** `http://localhost:4000`  
**Server Port:** `4000`  
**Database:** MongoDB (ensure running on `mongodb://localhost:27017/fleet_management`)  
**Required Setup:** Start backend server with `npm run dev`

## Authentication Routes Testing

### 1. User Registration
```bash
# Test 1.1: Valid Registration
curl -X POST "http://localhost:4000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "admin"
  }'

# Test 1.2: Invalid Email Format
curl -X POST "http://localhost:4000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid User",
    "email": "invalid-email",
    "password": "ValidPass123!"
  }'

# Test 1.3: Missing Required Fields
curl -X POST "http://localhost:4000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "test@example.com"
  }'
```

### 2. User Login
```bash
# Test 2.1: Successful Login
curl -X POST "http://localhost:4000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# Test 2.2: Invalid Credentials
curl -X POST "http://localhost:4000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword"
  }'

# Test 2.3: Non-existent User
curl -X POST "http://localhost:4000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SomePassword"
  }'
```

### 3. Token Refresh
```bash
# Test 3.1: Valid Refresh (requires refresh token cookie from login)
curl -X POST "http://localhost:4000/auth/refresh" \
  -H "Content-Type: application/json"

# Test 3.2: Missing Refresh Token
curl -X POST "http://localhost:4000/auth/refresh" \
  -H "Content-Type: application/json" \
  -b "refreshToken="

# Test 3.3: Invalid Refresh Token
curl -X POST "http://localhost:4000/auth/refresh" \
  -H "Content-Type: application/json" \
  -b "refreshToken=invalid_token_here"
```

### 4. Logout
```bash
# Test 4.1: Successful Logout
curl -X POST "http://localhost:4000/auth/logout" \
  -H "Content-Type: application/json" \
  -b "refreshToken=<VALID_REFRESH_TOKEN>"

# Test 4.2: Logout Without Token
curl -X POST "http://localhost:4000/auth/logout" \
  -H "Content-Type: application/json"
```

## Admin Routes Testing

### 5. Create Driver (Admin Only)
```bash
# Prerequisites: Login as admin to get access token
ACCESS_TOKEN="<ADMIN_ACCESS_TOKEN>"

# Test 5.1: Create Driver Successfully
curl -X POST "http://localhost:4000/admin/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Jane Driver",
    "email": "jane.driver@example.com",
    "password": "DriverPass123!",
    "licenseNo": "DL-1234567890",
    "phone": "+919876543210",
    "address": "123 Driver Street, City, State"
  }'

# Test 5.2: Create Driver Without Auth
curl -X POST "http://localhost:4000/admin/drivers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Driver",
    "email": "unauth@example.com",
    "password": "Pass123!"
  }'

# Test 5.3: Create Driver with Invalid Data
curl -X POST "http://localhost:4000/admin/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "licenseNo": "INVALID_LICENSE_FORMAT"
  }'
```

## Driver Routes Testing

### 6. Get All Drivers
```bash
# Test 6.1: Get All Drivers (Admin Only)
curl -X GET "http://localhost:4000/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 6.2: Get Drivers Without Auth
curl -X GET "http://localhost:4000/drivers" \
  -H "Content-Type: application/json"
```

### 7. Get Driver by ID
```bash
DRIVER_ID="5f50db8b0f4a541550456789"

# Test 7.1: Get Valid Driver
curl -X GET "http://localhost:4000/drivers/$DRIVER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 7.2: Get Non-existent Driver
curl -X GET "http://localhost:4000/drivers/5f50db8b0f4a541550456799" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 8. Update Driver
```bash
# Test 8.1: Update Driver Successfully
curl -X PUT "http://localhost:4000/drivers/$DRIVER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "licenseNo": "DL-UPDATED123456",
    "phone": "+919876543211",
    "address": "456 Updated Address, City, State",
    "experienceYears": 6
  }'

# Test 8.2: Update with Invalid Data
curl -X PUT "http://localhost:4000/drivers/$DRIVER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "licenseNo": "",
    "phone": "invalid-phone"
  }'
```

### 9. Deactivate Driver
```bash
# Test 9.1: Deactivate Driver Successfully
curl -X PUT "http://localhost:4000/drivers/$DRIVER_ID/deactivate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "reason": "License expired"
  }'

# Test 9.2: Deactivate Without Reason
curl -X PUT "http://localhost:4000/drivers/$DRIVER_ID/deactivate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Vehicle Routes Testing

### 10. Create Vehicle
```bash
# Test 10.1: Create Vehicle Successfully
curl -X POST "http://localhost:4000/vehicles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "vehicleNo": "KA-01-AB-1234",
    "model": "Toyota Innova",
    "type": "Van",
    "capacityKg": 1500,
    "status": "available",
    "insurance": {
      "policyNumber": "POL123456",
      "expiryDate": "2026-12-31"
    }
  }'

VEHICLE_ID="5f50db8b0f4a54155045678A"
DRIVER_ID_2="5f50db8b0f4a54155045678B"
```

### 11. Assign Driver to Vehicle
```bash
# Test 11.1: Assign Driver Successfully
curl -X POST "http://localhost:4000/vehicles/$VEHICLE_ID/assign-driver/$DRIVER_ID_2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 11.2: Assign Non-existent Driver
curl -X POST "http://localhost:4000/vehicles/$VEHICLE_ID/assign-driver/5f50db8b0f4a541550456799" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 12. Update Vehicle Status
```bash
# Test 12.1: Update Vehicle Status
curl -X PATCH "http://localhost:4000/vehicles/$VEHICLE_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "status": "maintenance"
  }'

# Test 12.2: Invalid Status Update
curl -X PATCH "http://localhost:4000/vehicles/$VEHICLE_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "status": "invalid_status"
  }'
```

## Trip Routes Testing

### 13. Create Trip
```bash
CLIENT_ID="5f50db8b0f4a54155045678C"

# Test 13.1: Create Trip Successfully
curl -X POST "http://localhost:4000/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "clientId": "$CLIENT_ID",
    "driverId": "$DRIVER_ID_2",
    "vehicleId": "$VEHICLE_ID",
    "startLocation": "Delhi",
    "endLocation": "Mumbai",
    "totalAmount": 5000,
    "advancePayment": 2000,
    "status": "scheduled"
  }'

TRIP_ID="5f50db8b0f4a54155045678D"
```

### 14. Add Progress Update
```bash
# Test 14.1: Add Progress Update (Driver Auth Required)
DRIVER_TOKEN="<DRIVER_ACCESS_TOKEN>"

curl -X POST "http://localhost:4000/trips/$TRIP_ID/progress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d '{
    "location": "Agra",
    "status": "reached",
    "notes": "On schedule, no issues",
    "fuelConsumed": 15.5,
    "distanceCovered": 200.5
  }'

# Test 14.2: Add Progress Without Auth
curl -X POST "http://localhost:4000/trips/$TRIP_ID/progress" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Agra",
    "status": "reached"
  }'
```

### 15. Complete Trip
```bash
# Test 15.1: Complete Trip Successfully
curl -X POST "http://localhost:4000/trips/$TRIP_ID/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d '{
    "completionDate": "2024-01-15T10:30:00Z",
    "actualAmount": 5000,
    "fuelConsumed": 45.5,
    "distanceCovered": 1400.5,
    "remarks": "Trip completed successfully"
  }'
```

### 16. Get Driver's Trips
```bash
# Test 16.1: Get Driver's Own Trips
curl -X GET "http://localhost:4000/trips/my" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN"

# Test 16.2: Get Driver Trips Without Auth
curl -X GET "http://localhost:4000/trips/my" \
  -H "Content-Type: application/json"
```

## Analytics Routes Testing

### 17. Dashboard Analytics (Admin Only)
```bash
# Test 17.1: Get Dashboard Stats
curl -X GET "http://localhost:4000/analytics/dashboard" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 17.2: Get Trip Summary
curl -X GET "http://localhost:4000/analytics/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 17.3: Get Top Clients (with limit)
curl -X GET "http://localhost:4000/analytics/top-clients?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 18. Analytics Without Auth
```bash
# Test 18.1: Access Analytics Without Auth
curl -X GET "http://localhost:4000/analytics/dashboard" \
  -H "Content-Type: application/json"
```

## Client Routes Testing

### 19. Create Client
```bash
# Test 19.1: Create Client Successfully
curl -X POST "http://localhost:4000/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "ABC Logistics",
    "email": "contact@abcl.com",
    "phone": "+919876543210",
    "address": {
      "street": "123 Business Park",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "gstNumber": "27AABCCDDEEFFG",
    "contactPerson": {
      "name": "Rahul Sharma",
      "phone": "+919876543211",
      "email": "rahul@abcl.com"
    }
  }'

CLIENT_ID="5f50db8b0f4a54155045678E"
```

### 20. Update Client
```bash
# Test 20.1: Update Client Successfully
curl -X PUT "http://localhost:4000/clients/$CLIENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "ABC Logistics Pvt Ltd",
    "email": "sales@abcl.com",
    "contactPerson": {
      "name": "Priya Sharma",
      "phone": "+919876543212",
      "email": "priya@abcl.com"
    },
    "creditLimit": 75000
  }'
```

## Maintenance Routes Testing

### 21. Create Maintenance Log
```bash
# Test 21.1: Create Maintenance Log
curl -X POST "http://localhost:4000/maintenance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "vehicleId": "$VEHICLE_ID",
    "type": "service",
    "description": "Regular service and oil change",
    "cost": 2500,
    "odometerReading": 15000,
    "serviceCenter": {
      "name": "Quick Service Center",
      "address": "789 Service Road, Mumbai",
      "contact": "+919876543210"
    }
  }'

MAINTENANCE_ID="5f50db8b0f4a54155045678F"
```

### 22. Get Maintenance by Vehicle
```bash
# Test 22.1: Get Maintenance Logs for Vehicle
curl -X GET "http://localhost:4000/maintenance/vehicle/$VEHICLE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Route Routes Testing

### 23. Create Route
```bash
# Test 23.1: Create Route Successfully
curl -X POST "http://localhost:4000/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Delhi-Mumbai Route",
    "stops": [
      {"location": "Delhi", "type": "HR", "duration": 2},
      {"location": "Agra", "type": "AC", "duration": 3},
      {"location": "Mumbai", "type": "BR", "duration": 0}
    ],
    "totalDistance": 1400.5,
    "estimatedDuration": 18
  }'

ROUTE_ID="5f50db8b0f4a54155045678G"
```

### 24. Update Route
```bash
# Test 24.1: Update Route Successfully
curl -X PUT "http://localhost:4000/routes/$ROUTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Delhi-Mumbai Express Route",
    "stops": [
      {"location": "Delhi", "type": "HR", "duration": 2},
      {"location": "Mumbai", "type": "BR", "duration": 0}
    ],
    "totalDistance": 1400.5,
    "estimatedDuration": 16
  }'
```

## Profile Routes Testing

### 25. Get Own Profile
```bash
# Test 25.1: Get Profile Successfully
curl -X GET "http://localhost:4000/profile/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 25.2: Get Profile Without Auth
curl -X GET "http://localhost:4000/profile/me" \
  -H "Content-Type: application/json"
```

### 26. Admin Profile Access
```bash
# Test 26.1: Admin Access to Profile
curl -X GET "http://localhost:4000/profile/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 26.2: Non-Admin Access to Admin Profile
curl -X GET "http://localhost:4000/profile/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN"
```

## Error Handling Tests

### 27. Validation Errors
```bash
# Test 27.1: Invalid ObjectID Format
curl -X GET "http://localhost:4000/drivers/invalid-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 27.2: Non-existent Resource
curl -X GET "http://localhost:4000/drivers/5f50db8b0f4a541550456799" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 27.3: Malformed JSON
curl -X POST "http://localhost:4000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

### 28. Rate Limiting Tests
```bash
# Test 28.1: Rapid Requests (if rate limiting enabled)
for i in {1..10}; do
  curl -X GET "http://localhost:4000/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
wait
```

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "statusCode": 200,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": {
    "name": "ValidationError",
    "message": "Validation failed"
  }
}
```

## Test Data Cleanup

```bash
# Clean up test data (run after testing)
curl -X DELETE "http://localhost:4000/drivers/$DRIVER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

curl -X DELETE "http://localhost:4000/clients/$CLIENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

curl -X DELETE "http://localhost:4000/vehicles/$VEHICLE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Postman Collection Structure

```json
{
  "info": {
    "name": "Fleet Management API v1",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000"
    },
    {
      "key": "adminToken",
      "value": ""
    },
    {
      "key": "driverToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"SecurePass123!\"}"
            },
            "url": "{{baseUrl}}/auth/register"
          }
        }
      ]
    }
  ]
}
```

## Testing Checklist

- [ ] All authentication endpoints tested
- [ ] Role-based access control verified
- [ ] Input validation tested for all endpoints
- [ ] Error handling responses consistent
- [ ] Response structure standardized
- [ ] Database relationships maintained
- [ ] Token authentication working
- [ ] Refresh token rotation functional
- [ ] Admin-only endpoints protected
- [ ] Driver-specific endpoints restricted
- [ ] Progress tracking operational
- [ ] Analytics accessible to admins
- [ ] File upload validation (if applicable)
- [ ] Rate limiting functional (if enabled)

## Common Test Scenarios

1. **Happy Path**: Valid requests with expected data
2. **Validation Errors**: Invalid data formats, missing required fields
3. **Authentication Errors**: Missing/invalid tokens
4. **Authorization Errors**: Wrong role attempting restricted operations
5. **Not Found**: Non-existent resource IDs
6. **Conflict**: Duplicate data, business rule violations
7. **Server Errors**: Database connectivity, internal server issues

## Notes

- Replace placeholder tokens and IDs with actual values from your test environment
- Ensure MongoDB is running and accessible
- Some tests require prerequisite data setup
- Test in order when dependencies exist between resources
- Monitor server logs for detailed error information during testing
