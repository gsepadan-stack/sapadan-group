import api from './api';
import { MitraPetani, MitraSummary } from '../types';

export const mitraService = {
  getAll: () => api.get<MitraPetani[]>('/mitra'),
  getById: (id: string) => api.get<MitraPetani>(`/mitra/${id}`),
  create: (data: Partial<MitraPetani>) => api.post<MitraPetani>('/mitra', data),
  update: (id: string, data: Partial<MitraPetani>) => api.put<MitraPetani>(`/mitra/${id}`, data),
  delete: (id: string) => api.delete(`/mitra/${id}`),
  getSummary: (id: string) => api.get<MitraSummary>(`/mitra/${id}/summary`),

  addPakan: (id: string, data: any) => api.post(`/mitra/${id}/pakan`, data),
  deletePakan: (id: string, tid: string) => api.delete(`/mitra/${id}/pakan/${tid}`),

  addBibit: (id: string, data: any) => api.post(`/mitra/${id}/bibit`, data),
  deleteBibit: (id: string, tid: string) => api.delete(`/mitra/${id}/bibit/${tid}`),

  addPinjaman: (id: string, data: any) => api.post(`/mitra/${id}/pinjaman`, data),
  lunasPinjaman: (id: string, tid: string) => api.patch(`/mitra/${id}/pinjaman/${tid}/lunas`, {}),
  deletePinjaman: (id: string, tid: string) => api.delete(`/mitra/${id}/pinjaman/${tid}`),

  addPanen: (id: string, data: any) => api.post(`/mitra/${id}/panen`, data),
};
