# Fleet Management System - API Request Body Templates

## 🔐 Authentication Routes

### POST /v1/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "driver"
}
```

### POST /v1/auth/login
Login user
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

## 👮 Admin Routes

### POST /v1/admin/drivers
Create driver with user account (Admin only)
```json
{
  "name": "Truck Operator",
  "email": "driver@example.com",
  "password": "driverPassword123",
  "licenseNo": "DL-1234567890",
  "phone": "+919876543210",
  "address": "123 Main Street, City, State",
  "experienceYears": 5
}
```

## 🚙 Vehicle Routes

### POST /v1/vehicles
Create a new vehicle
```json
{
  "vehicleNo": "KA-01-AB-1234",
  "model": "Toyota Innova",
  "type": "Van",
  "capacityKg": 1500,
  "status": "available",
  "insurance": {
    "policyNumber": "POL123456",
    "expiryDate": "2026-12-31"
  },
  "assignedDrivers": ["64f7a8b9c3d4e5f678901234"],
  "documents": {
    "rcBookUrl": "https://example.com/rc-book.pdf",
    "insuranceUrl": "https://example.com/insurance.pdf",
    "pollutionCertUrl": "https://example.com/pollution.pdf"
  }
}
```

### PATCH /v1/vehicles/:id/status
Update vehicle status
```json
{
  "status": "maintenance"
}
```

### POST /v1/vehicles/:vehicleId/assign-driver/:driverId
Assign driver to vehicle (Admin only)
```json
{
  "assignedDriver": "64f7a8b9c3d4e5f678901234"
}
```

## 🚍 Driver Routes

### POST /v1/drivers
Create driver (Admin only)
```json
{
  "name": "Truck Operator",
  "email": "driver@example.com",
  "password": "driverPassword123",
  "licenseNo": "DL-1234567890",
  "phone": "+919876543210",
  "address": "123 Main Street, City, State",
  "experienceYears": 5
}
```

### PUT /v1/drivers/:id
Update driver profile
```json
{
  "licenseNo": "DL-UPDATED12345",
  "contact": {
    "phone": "+919876543210",
    "address": "456 Updated Address"
  },
  "experienceYears": 6,
  "status": "active"
}
```

### PUT /v1/drivers/:id/deactivate
Deactivate driver (Admin only)
```json
{
  "reason": "License expired"
}
```

## 🚚 Trip Routes

### POST /v1/trips
Create a new trip
```json
{
  "clientId": "64f7a8b9c3d4e5f678901234",
  "driverId": "64f7a8b9c3d4e5f678901235",
  "vehicleId": "64f7a8b9c3d4e5f678901236",
  "startLocation": "Delhi",
  "endLocation": "Mumbai",
  "totalAmount": 5000,
  "stops": [
    {
      "location": "Agra",
      "type": "HL",
      "duration": 2
    },
    {
      "location": "Ahmedabad",
      "type": "AC",
      "duration": 3
    }
  ],
  "advancePayment": 2000,
  "status": "scheduled"
}
```

### PUT /v1/trips/:id
Update trip details
```json
{
  "startLocation": "Delhi",
  "endLocation": "Bangalore",
  "totalAmount": 6000,
  "stops": [
    {
      "location": "Agra",
      "type": "HL",
      "duration": 2
    }
  ],
  "status": "in-progress"
}
```

### POST /v1/trips/:id/progress
Add progress update
```json
{
  "location": "Agra",
  "status": "reached",
  "notes": "On schedule, no issues",
  "fuelConsumed": 15.5,
  "distanceCovered": 200.5
}
```

### POST /v1/trips/:id/complete
Mark trip as completed
```json
{
  "completionDate": "2024-01-15T10:30:00Z",
  "actualAmount": 5000,
  "fuelConsumed": 45.5,
  "distanceCovered": 1400.5,
  "remarks": "Trip completed successfully"
}
```

### GET /v1/trips/my
Get trips for authenticated driver (Driver only)

## 🛣️ Route Routes

### POST /v1/routes
Create a new route
```json
{
  "name": "Delhi-Mumbai Route",
  "stops": [
    {
      "location": "Delhi",
      "type": "HR",
      "duration": 2
    },
    {
      "location": "Agra",
      "type": "AC",
      "duration": 3
    },
    {
      "location": "Gwalior",
      "type": "HL",
      "duration": 2
    },
    {
      "location": "Mumbai",
      "type": "BR"
    }
  ],
  "totalDistance": 1400.5,
  "estimatedDuration": 18
}
```

### PUT /v1/routes/:id
Update route
```json
{
  "name": "Delhi-Mumbai Express Route",
  "stops": [
    {
      "location": "Delhi",
      "type": "HR",
      "duration": 2
    },
    {
      "location": "Agra",
      "type": "AC",
      "duration": 2
    },
    {
      "location": "Mumbai",
      "type": "BR"
    }
  ],
  "totalDistance": 1400.5,
  "estimatedDuration": 16
}
```

## 👥 Client Routes

### POST /v1/clients
Create a new client
```json
{
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
  },
  "creditLimit": 50000,
  "paymentTerms": "Net 30 days"
}
```

### PUT /v1/clients/:id
Update client
```json
{
  "name": "ABC Logistics Pvt Ltd",
  "email": "sales@abcl.com",
  "phone": "+919876543210",
  "address": {
    "street": "456 Updated Business Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "contactPerson": {
    "name": "Priya Sharma",
    "phone": "+919876543212",
    "email": "priya@abcl.com"
  },
  "creditLimit": 75000
}
```

## 🔧 Maintenance Routes

### POST /v1/maintenance
Create maintenance log
```json
{
  "vehicleId": "64f7a8b9c3d4e5f678901234",
  "type": "service",
  "description": "Regular service and oil change",
  "cost": 2500,
  "odometerReading": 15000,
  "serviceCenter": {
    "name": "Quick Service Center",
    "address": "789 Service Road, Mumbai",
    "contact": "+919876543210"
  },
  "partsReplaced": [
    {
      "part": "Engine Oil",
      "quantity": 5,
      "cost": 1000
    },
    {
      "part": "Oil Filter",
      "quantity": 1,
      "cost": 500
    }
  ],
  "nextServiceDue": "2024-06-01"
}
```

### PUT /v1/maintenance/:id
Update maintenance log
```json
{
  "type": "repair",
  "description": "Engine repair after breakdown",
  "cost": 15000,
  "odometerReading": 15200,
  "partsReplaced": [
    {
      "part": "Engine Piston",
      "quantity": 1,
      "cost": 12000
    }
  ],
  "status": "completed"
}
```

## 📊 Analytics Routes

### GET /v1/analytics/dashboard
Get dashboard statistics

### GET /v1/analytics/trips
Get trip summary

### GET /v1/analytics/vehicles
Get vehicle summary

### GET /v1/analytics/drivers
Get driver summary

### GET /v1/analytics/financial
Get financial summary

### GET /v1/analytics/clients?limit=5
Get top clients (with optional limit)

## 🔑 Authentication Headers

For protected routes, include the following header:
```
Authorization: Bearer <access_token>
```

## 📝 Notes

1. All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
2. Phone numbers should include country code: `+919876543210`
3. Vehicle registration numbers should be uppercase: `KA-01-AB-1234`
4. Status values are predefined enums (check validation schemas)
5. All amounts are in INR (Indian Rupees)
6. Distance values are in kilometers (km)
7. Fuel consumption is in liters (L)

## 🔒 Role-Based Access

- **Public**: Auth routes (register, login, refresh, logout)
- **Driver**: Can access their own trips (`/trips/my`)
- **Admin**: Can access all routes except analytics (read-only for most)
- **Super Admin**: Full access to all routes including analytics

## ⚠️ Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "ValidationError"
}
