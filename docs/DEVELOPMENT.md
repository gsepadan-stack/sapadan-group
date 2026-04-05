# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git
- Code Editor (VS Code recommended)

### Initial Setup

1. **Clone & Install**
```bash
git clone <repository-url>
cd sapadan-fishery-system
npm run install:all
```

2. **Database Setup**
```bash
# Create database
createdb sapadan_fishery

# Configure backend/.env
cd backend
cp .env.example .env
# Edit DATABASE_URL

# Run migrations
npm run prisma:migrate
npm run prisma:generate

# Seed data
npx tsx prisma/seed.ts
```

3. **Configure Frontend**
```bash
cd frontend
cp .env.example .env
# Edit VITE_API_URL if needed
```

4. **Start Development**
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## Project Architecture

### Frontend Architecture

```
frontend/src/
├── app/                    # Redux store & global config
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── theme.ts           # MUI theme configuration
│
├── modules/               # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── authSlice.ts  # Redux slice
│   │   └── LoginPage.tsx # Page component
│   ├── sales/
│   │   ├── salesSlice.ts
│   │   ├── SalesOrderList.tsx
│   │   ├── SalesOrderForm.tsx
│   │   └── ProductList.tsx
│   └── dashboard/
│       └── DashboardPage.tsx
│
├── components/            # Reusable components
│   ├── common/
│   ├── forms/
│   └── tables/
│
├── layouts/              # Layout components
│   └── DashboardLayout.tsx
│
├── routes/               # Route configuration
│   └── AppRoutes.tsx
│
├── services/             # API services
│   ├── api.ts           # Axios instance
│   ├── authService.ts
│   └── salesService.ts
│
├── types/                # TypeScript types
│   └── index.ts
│
└── utils/                # Utility functions
    ├── formatters.ts
    └── validators.ts
```

### Backend Architecture

```
backend/src/
├── controllers/          # Request handlers
│   ├── auth.controller.ts
│   ├── sales.controller.ts
│   └── dashboard.controller.ts
│
├── routes/              # API routes
│   ├── auth.routes.ts
│   ├── sales.routes.ts
│   └── dashboard.routes.ts
│
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT authentication
│   └── errorHandler.ts # Global error handler
│
├── lib/                # Libraries & utilities
│   └── prisma.ts      # Prisma client
│
└── server.ts           # Express app entry point
```

---

## Development Workflow

### 1. Adding New Feature Module

#### Frontend

```bash
# Create module structure
mkdir -p frontend/src/modules/[module-name]
touch frontend/src/modules/[module-name]/[Module]Slice.ts
touch frontend/src/modules/[module-name]/[Module]List.tsx
touch frontend/src/modules/[module-name]/[Module]Form.tsx
```

**Example: Adding Kolam Module**

1. Create Redux slice (`kolamSlice.ts`):
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kolamService } from '../../services/kolamService';

export const fetchKolams = createAsyncThunk('kolam/fetchKolams', async () => {
  return await kolamService.getKolams();
});

const kolamSlice = createSlice({
  name: 'kolam',
  initialState: { kolams: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKolams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKolams.fulfilled, (state, action) => {
        state.loading = false;
        state.kolams = action.payload;
      });
  },
});

export default kolamSlice.reducer;
```

2. Create service (`kolamService.ts`):
```typescript
import api from './api';

export const kolamService = {
  getKolams: async () => {
    const response = await api.get('/kolam');
    return response.data;
  },
  // ... other methods
};
```

3. Add to store (`app/store.ts`):
```typescript
import kolamReducer from '../modules/kolam/kolamSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sales: salesReducer,
    kolam: kolamReducer, // Add this
  },
});
```

4. Create routes (`routes/AppRoutes.tsx`):
```typescript
<Route path="kolam">
  <Route index element={<KolamList />} />
  <Route path="new" element={<KolamForm />} />
  <Route path=":id/edit" element={<KolamForm />} />
</Route>
```

#### Backend

1. Update Prisma schema (already done)

2. Create controller (`controllers/kolam.controller.ts`):
```typescript
import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getKolams = async (req: AuthRequest, res: Response) => {
  const kolams = await prisma.kolam.findMany({
    include: {
      feedingLogs: true,
      healthLogs: true,
    },
  });
  res.json(kolams);
};

export const createKolam = async (req: AuthRequest, res: Response) => {
  const kolam = await prisma.kolam.create({
    data: req.body,
  });
  res.status(201).json(kolam);
};
```

3. Create routes (`routes/kolam.routes.ts`):
```typescript
import { Router } from 'express';
import { getKolams, createKolam } from '../controllers/kolam.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getKolams);
router.post('/', createKolam);

export default router;
```

4. Register in server (`server.ts`):
```typescript
import kolamRoutes from './routes/kolam.routes.js';
app.use('/api/kolam', kolamRoutes);
```

---

## Code Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ❌ Bad
const getUser = async (id: any) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  
  return <div>{title}</div>;
};

// ❌ Bad - No types
const MyComponent = ({ title, onSubmit }) => {
  return <div>{title}</div>;
};
```

### API Calls

```typescript
// ✅ Good - Use service layer
const fetchData = async () => {
  try {
    const data = await salesService.getOrders();
    setOrders(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// ❌ Bad - Direct axios call in component
const fetchData = async () => {
  const response = await axios.get('http://localhost:5000/api/sales/orders');
  setOrders(response.data);
};
```

---

## Testing

### Backend Testing (Example)

```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@sapadan.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

---

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name add_new_field

# Apply migrations
npx prisma migrate deploy

# Reset database (CAUTION!)
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio

# Format schema
npx prisma format
```

### Adding New Model

1. Edit `prisma/schema.prisma`:
```prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("new_models")
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_new_model
```

3. Generate client:
```bash
npx prisma generate
```

---

## Debugging

### Frontend Debugging

```typescript
// Redux DevTools (already configured)
// Open browser DevTools → Redux tab

// Console logging
console.log('State:', useAppSelector(state => state.sales));

// React DevTools
// Install React DevTools browser extension
```

### Backend Debugging

```typescript
// Add breakpoints in VS Code
// Create .vscode/launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Prisma Client not found
```bash
cd backend
npm run prisma:generate
```

### Issue: Port already in use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Issue: CORS errors
Check `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/kolam-module

# Commit changes
git add .
git commit -m "feat: add kolam management module"

# Push to remote
git push origin feature/kolam-module

# Create Pull Request on GitHub/GitLab
```

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## Performance Tips

1. **Use React.memo for expensive components**
2. **Implement pagination for large lists**
3. **Use Prisma select to fetch only needed fields**
4. **Add database indexes for frequently queried columns**
5. **Use lazy loading for routes**
6. **Optimize images and assets**

---

## Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material-UI](https://mui.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com)
