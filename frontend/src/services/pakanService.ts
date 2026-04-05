import api from './api';
import { Supplier, PakanPurchase, PakanStock } from '../types';

export const pakanService = {
  // Suppliers
  getSuppliers: () => api.get<Supplier[]>('/pakan/suppliers'),
  
  createSupplier: (data: Partial<Supplier>) => 
    api.post<Supplier>('/pakan/suppliers', data),
  
  updateSupplier: (id: string, data: Partial<Supplier>) =>
    api.put<Supplier>(`/pakan/suppliers/${id}`, data),
  
  deleteSupplier: (id: string) => api.delete(`/pakan/suppliers/${id}`),
  
  // Purchases
  getPurchases: () => api.get<PakanPurchase[]>('/pakan/purchases'),
  
  createPurchase: (data: Partial<PakanPurchase>) =>
    api.post<PakanPurchase>('/pakan/purchases', data),
  
  // Stock
  getStock: () => api.get<PakanStock[]>('/pakan/stock'),
};
