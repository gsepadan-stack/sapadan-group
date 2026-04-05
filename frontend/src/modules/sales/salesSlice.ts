import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesService } from '../../services/salesService';
import { SalesOrder, Product, Customer } from '../../types';

interface SalesState {
  orders: SalesOrder[];
  products: Product[];
  customers: Customer[];
  selectedOrder: SalesOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  orders: [],
  products: [],
  customers: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('sales/fetchOrders', async (params?: any) => {
  return await salesService.getOrders(params);
});

export const fetchProducts = createAsyncThunk('sales/fetchProducts', async () => {
  return await salesService.getProducts();
});

export const fetchCustomers = createAsyncThunk('sales/fetchCustomers', async () => {
  return await salesService.getCustomers();
});

export const createOrder = createAsyncThunk(
  'sales/createOrder',
  async (data: Partial<SalesOrder>) => {
    return await salesService.createOrder(data);
  }
);

export const updateOrderStatus = createAsyncThunk(
  'sales/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }) => {
    return await salesService.updateOrderStatus(id, status);
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { setSelectedOrder, clearError } = salesSlice.actions;
export default salesSlice.reducer;
