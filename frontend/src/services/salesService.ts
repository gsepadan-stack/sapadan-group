import api from './api';
import { SalesOrder, Product, Customer } from '../types';

export const salesService = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Sales Orders
  getOrders: async (params?: any): Promise<SalesOrder[]> => {
    const response = await api.get('/sales/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<SalesOrder> => {
    const response = await api.get(`/sales/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: Partial<SalesOrder>): Promise<SalesOrder> => {
    const response = await api.post('/sales/orders', data);
    return response.data;
  },

  updateOrder: async (id: string, data: Partial<SalesOrder>): Promise<SalesOrder> => {
    const response = await api.put(`/sales/orders/${id}`, data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<SalesOrder> => {
    const response = await api.patch(`/sales/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/sales/orders/${id}`);
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Reports
  exportOrderPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/sales/orders/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportOrdersExcel: async (params?: any): Promise<Blob> => {
    const response = await api.get('/sales/orders/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
