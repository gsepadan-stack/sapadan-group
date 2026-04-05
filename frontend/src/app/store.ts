import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import salesReducer from '../modules/sales/salesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sales: salesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
