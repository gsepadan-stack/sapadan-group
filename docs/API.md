# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/login
Login user and get JWT token

**Request Body:**
```json
{
  "email": "owner@sapadan.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "owner@sapadan.com",
    "name": "Owner Sapadan",
    "role": "OWNER"
  }
}
```

### GET /auth/me
Get current authenticated user

**Response:**
```json
{
  "id": "uuid",
  "email": "owner@sapadan.com",
  "name": "Owner Sapadan",
  "role": "OWNER",
  "cabangId": null
}
```

---

## Product Endpoints

### GET /products
Get all products

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Ikan Lele Jumbo",
    "jenis": "Lele",
    "hargaPerKg": 25000,
    "stokKg": 500,
    "deskripsi": "Ikan lele segar ukuran jumbo",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /products
Create new product

**Request Body:**
```json
{
  "name": "Ikan Nila",
  "jenis": "Nila",
  "hargaPerKg": 30000,
  "stokKg": 300,
  "deskripsi": "Ikan nila segar"
}
```

### PUT /products/:id
Update product

**Request Body:**
```json
{
  "name": "Ikan Nila Merah",
  "hargaPerKg": 32000,
  "stokKg": 350
}
```

### DELETE /products/:id
Delete product

**Response:**
```json
{
  "message": "Produk berhasil dihapus"
}
```

---

## Sales Order Endpoints

### GET /sales/orders
Get all sales orders

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, DIPROSES, DIKIRIM, SELESAI)
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

**Response:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "ORD-1234567890",
    "customerId": "uuid",
    "customerName": "John Doe",
    "customerPhone": "08123456789",
    "customerAddress": "Jl. Example No. 123",
    "totalAmount": 500000,
    "status": "PENDING",
    "orderDate": "2024-01-01T00:00:00.000Z",
    "deliveryDate": null,
    "notes": null,
    "createdBy": "uuid",
    "cabangId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Ikan Lele Jumbo",
        "quantity": 20,
        "pricePerKg": 25000,
        "subtotal": 500000
      }
    ],
    "customer": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "08123456789",
      "address": "Jl. Example No. 123"
    }
  }
]
```

### GET /sales/orders/:id
Get single order by ID

### POST /sales/orders
Create new sales order

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "08123456789",
  "customerAddress": "Jl. Example No. 123",
  "orderDate": "2024-01-01",
  "deliveryDate": "2024-01-05",
  "notes": "Kirim pagi",
  "items": [
    {
      "productId": "uuid",
      "productName": "Ikan Lele Jumbo",
      "quantity": 20,
      "pricePerKg": 25000,
      "subtotal": 500000
    }
  ],
  "totalAmount": 500000
}
```

### PUT /sales/orders/:id
Update sales order

### PATCH /sales/orders/:id/status
Update order status only

**Request Body:**
```json
{
  "status": "DIPROSES"
}
```

### DELETE /sales/orders/:id
Delete sales order

---

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics

**Response:**
```json
{
  "totalPenjualan": 15000000,
  "totalProfit": 4500000,
  "totalOrder": 45,
  "pendingOrder": 12,
  "mortalitasRate": 2.5,
  "biayaPakan": 3000000
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Token tidak ditemukan"
}
```

### 403 Forbidden
```json
{
  "message": "Akses ditolak"
}
```

### 404 Not Found
```json
{
  "message": "Resource tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Role-Based Access Control

### Roles
- **OWNER**: Full access to all features
- **ADMIN**: Access to all operational features
- **SUPERVISOR**: Can approve lembur, view reports
- **STAFF**: Basic operational access

### Permissions Matrix

| Feature | OWNER | ADMIN | SUPERVISOR | STAFF |
|---------|-------|-------|------------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Sales Orders | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ❌ | ❌ |
| Kolam | ✅ | ✅ | ✅ | ✅ |
| Pakan | ✅ | ✅ | ✅ | ❌ |
| Payroll | ✅ | ✅ | ❌ | ❌ |
| Lembur Approval | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
