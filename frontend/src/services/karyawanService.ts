import api from './api';
import { Karyawan, Payroll, Lembur } from '../types';

export const karyawanService = {
  // Karyawan
  getAll: () => api.get<Karyawan[]>('/karyawan'),
  
  getById: (id: string) => api.get<Karyawan>(`/karyawan/${id}`),
  
  create: (data: Partial<Karyawan>) => api.post<Karyawan>('/karyawan', data),
  
  update: (id: string, data: Partial<Karyawan>) =>
    api.put<Karyawan>(`/karyawan/${id}`, data),
  
  delete: (id: string) => api.delete(`/karyawan/${id}`),
  
  // Payroll
  getPayrolls: (params?: { bulan?: string; tahun?: number }) =>
    api.get<Payroll[]>('/karyawan/payroll/list', { params }),
  
  generatePayroll: (data: Partial<Payroll>) =>
    api.post<Payroll>('/karyawan/payroll/generate', data),
  
  // Lembur
  getLemburs: (approved?: boolean) =>
    api.get<Lembur[]>('/karyawan/lembur/list', { 
      params: approved !== undefined ? { approved } : {} 
    }),
  
  createLembur: (data: Partial<Lembur>) =>
    api.post<Lembur>('/karyawan/lembur', data),
  
  approveLembur: (id: string) =>
    api.patch<Lembur>(`/karyawan/lembur/${id}/approve`),
};
