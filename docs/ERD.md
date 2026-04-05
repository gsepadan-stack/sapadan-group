# Entity Relationship Diagram (ERD)

## Database Schema - Sapadan Fishery Management System

### Core Entities

#### 1. Users
```
users
├── id (UUID, PK)
├── email (String, Unique)
├── password (String, Hashed)
├── name (String)
├── role (Enum: OWNER, ADMIN, SUPERVISOR, STAFF)
├── cabangId (UUID, FK -> cabang)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 2. Cabang (Branch)
```
cabang
├── id (UUID, PK)
├── name (String)
├── address (String)
├── phone (String)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 3. Products
```
products
├── id (UUID, PK)
├── name (String)
├── jenis (String)
├── hargaPerKg (Float)
├── stokKg (Float)
├── deskripsi (String, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 4. Customers
```
customers
├── id (UUID, PK)
├── name (String)
├── phone (String)
├── address (String)
├── email (String, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 5. Sales Orders
```
sales_orders
├── id (UUID, PK)
├── orderNumber (String, Unique)
├── customerId (UUID, FK -> customers)
├── customerName (String)
├── customerPhone (String)
├── customerAddress (String)
├── totalAmount (Float)
├── status (Enum: PENDING, DIPROSES, DIKIRIM, SELESAI)
├── orderDate (DateTime)
├── deliveryDate (DateTime, Optional)
├── notes (String, Optional)
├── createdBy (UUID, FK -> users)
├── cabangId (UUID, FK -> cabang, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 6. Order Items
```
order_items
├── id (UUID, PK)
├── orderId (UUID, FK -> sales_orders, CASCADE)
├── productId (UUID, FK -> products)
├── productName (String)
├── quantity (Float)
├── pricePerKg (Float)
├── subtotal (Float)
└── createdAt (DateTime)
```

#### 7. Kolam (Pond)
```
kolam
├── id (UUID, PK)
├── name (String)
├── jenisIkan (String)
├── jumlahIkan (Int)
├── mortalitas (Int, Default: 0)
├── cabangId (UUID, FK -> cabang, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 8. Feeding Logs
```
feeding_logs
├── id (UUID, PK)
├── kolamId (UUID, FK -> kolam, CASCADE)
├── jumlahKg (Float)
├── jenisPakan (String)
├── tanggal (DateTime)
├── catatan (String, Optional)
└── createdAt (DateTime)
```

#### 9. Health Logs
```
health_logs
├── id (UUID, PK)
├── kolamId (UUID, FK -> kolam, CASCADE)
├── tanggal (DateTime)
├── kondisi (String)
├── catatan (String, Optional)
└── createdAt (DateTime)
```

#### 10. Suppliers
```
suppliers
├── id (UUID, PK)
├── name (String)
├── phone (String)
├── address (String)
├── email (String, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 11. Pakan Purchases
```
pakan_purchases
├── id (UUID, PK)
├── supplierId (UUID, FK -> suppliers)
├── jenisPakan (String)
├── jumlahKg (Float)
├── hargaPerKg (Float)
├── totalHarga (Float)
├── tanggal (DateTime)
└── createdAt (DateTime)
```

#### 12. Karyawan (Employees)
```
karyawan
├── id (UUID, PK)
├── name (String)
├── phone (String)
├── address (String)
├── position (String)
├── gajiPokok (Float)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 13. Payroll
```
payroll
├── id (UUID, PK)
├── karyawanId (UUID, FK -> karyawan)
├── bulan (String)
├── tahun (Int)
├── gajiPokok (Float)
├── tunjangan (Float, Default: 0)
├── potongan (Float, Default: 0)
├── totalGaji (Float)
└── createdAt (DateTime)
```

#### 14. Lembur (Overtime)
```
lembur
├── id (UUID, PK)
├── karyawanId (UUID, FK -> karyawan)
├── tanggal (DateTime)
├── jamMulai (String)
├── jamSelesai (String)
├── totalJam (Float)
├── upahPerJam (Float)
├── totalUpah (Float)
├── approved (Boolean, Default: false)
├── approvedBy (String, Optional)
└── createdAt (DateTime)
```

#### 15. Audit Logs
```
audit_logs
├── id (UUID, PK)
├── userId (UUID, FK -> users)
├── action (String)
├── entity (String)
├── entityId (String)
├── details (String, Optional)
└── createdAt (DateTime)
```

## Relationships

### One-to-Many Relationships

1. **Cabang → Users** (1:N)
   - Satu cabang memiliki banyak users

2. **Cabang → Kolam** (1:N)
   - Satu cabang memiliki banyak kolam

3. **Cabang → Sales Orders** (1:N)
   - Satu cabang memiliki banyak sales orders

4. **User → Sales Orders** (1:N)
   - Satu user dapat membuat banyak sales orders

5. **User → Audit Logs** (1:N)
   - Satu user memiliki banyak audit logs

6. **Customer → Sales Orders** (1:N)
   - Satu customer dapat memiliki banyak sales orders

7. **Sales Order → Order Items** (1:N, CASCADE DELETE)
   - Satu sales order memiliki banyak order items

8. **Product → Order Items** (1:N)
   - Satu product dapat ada di banyak order items

9. **Kolam → Feeding Logs** (1:N, CASCADE DELETE)
   - Satu kolam memiliki banyak feeding logs

10. **Kolam → Health Logs** (1:N, CASCADE DELETE)
    - Satu kolam memiliki banyak health logs

11. **Supplier → Pakan Purchases** (1:N)
    - Satu supplier memiliki banyak pakan purchases

12. **Karyawan → Payroll** (1:N)
    - Satu karyawan memiliki banyak payroll records

13. **Karyawan → Lembur** (1:N)
    - Satu karyawan memiliki banyak lembur records

## Indexes

Recommended indexes for performance:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_cabang ON users(cabangId);

-- Sales Orders
CREATE INDEX idx_sales_orders_customer ON sales_orders(customerId);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_date ON sales_orders(orderDate);
CREATE INDEX idx_sales_orders_cabang ON sales_orders(cabangId);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(orderId);
CREATE INDEX idx_order_items_product ON order_items(productId);

-- Kolam
CREATE INDEX idx_kolam_cabang ON kolam(cabangId);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(userId);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entityId);
CREATE INDEX idx_audit_logs_created ON audit_logs(createdAt);
```

## Data Flow Examples

### Sales Order Creation Flow
```
1. User creates order
2. System checks/creates customer
3. System generates order number
4. System creates sales_order record
5. System creates order_items records
6. System creates audit_log entry
7. System updates product stock (optional)
```

### Kolam Monitoring Flow
```
1. Staff inputs feeding data → feeding_logs
2. Staff inputs health check → health_logs
3. System calculates mortalitas rate
4. Dashboard displays kolam statistics
```

### Payroll Processing Flow
```
1. System fetches karyawan data
2. System calculates lembur (approved only)
3. System generates payroll record
4. System calculates: gajiPokok + tunjangan + lembur - potongan
5. System generates slip gaji (PDF)
```
