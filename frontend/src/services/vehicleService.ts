import api from './api';
import { Vehicle, Maintenance, FuelLog, TripLog, VehicleStats } from '../types';

export const vehicleService = {
  getAll: () => api.get<Vehicle[]>('/vehicles'),
  
  getById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`),
  
  getStats: () => api.get<VehicleStats>('/vehicles/stats'),
  
  create: (data: Partial<Vehicle>) => api.post<Vehicle>('/vehicles', data),
  
  update: (id: string, data: Partial<Vehicle>) => 
    api.put<Vehicle>(`/vehicles/${id}`, data),
  
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  
  addMaintenance: (id: string, data: Partial<Maintenance>) =>
    api.post<Maintenance>(`/vehicles/${id}/maintenance`, data),
  
  addFuel: (id: string, data: Partial<FuelLog>) =>
    api.post<FuelLog>(`/vehicles/${id}/fuel`, data),
  
  addTrip: (id: string, data: Partial<TripLog>) =>
    api.post<TripLog>(`/vehicles/${id}/trip`, data),
};
