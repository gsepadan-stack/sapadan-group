import api from './api';
import { Kolam, FeedingLog, HealthLog } from '../types';

export const kolamService = {
  getAll: () => api.get<Kolam[]>('/kolam'),
  
  getById: (id: string) => api.get<Kolam>(`/kolam/${id}`),
  
  create: (data: Partial<Kolam>) => api.post<Kolam>('/kolam', data),
  
  update: (id: string, data: Partial<Kolam>) => 
    api.put<Kolam>(`/kolam/${id}`, data),
  
  delete: (id: string) => api.delete(`/kolam/${id}`),
  
  addFeeding: (id: string, data: Partial<FeedingLog>) =>
    api.post<FeedingLog>(`/kolam/${id}/feeding`, data),
  
  addHealth: (id: string, data: Partial<HealthLog>) =>
    api.post<HealthLog>(`/kolam/${id}/health`, data),
};
