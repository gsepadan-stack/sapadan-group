import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import LoginPage from '../modules/auth/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../modules/dashboard/DashboardPage';
import SalesOrderList from '../modules/sales/SalesOrderList';
import SalesOrderForm from '../modules/sales/SalesOrderForm';
import ProductList from '../modules/sales/ProductList';
import KolamList from '../modules/kolam/KolamList';
import KolamForm from '../modules/kolam/KolamForm';
import KolamDetail from '../modules/kolam/KolamDetail';
import PakanStock from '../modules/pakan/PakanStock';
import PurchaseForm from '../modules/pakan/PurchaseForm';
import SupplierList from '../modules/pakan/SupplierList';
import KaryawanList from '../modules/karyawan/KaryawanList';
import KaryawanForm from '../modules/karyawan/KaryawanForm';
import PayrollPage from '../modules/karyawan/PayrollPage';
import LemburPage from '../modules/karyawan/LemburPage';
import VehicleList from '../modules/fleet/VehicleList';
import VehicleForm from '../modules/fleet/VehicleForm';
import VehicleDetail from '../modules/fleet/VehicleDetail';
import FleetMonitor from '../modules/fleet/FleetMonitor';
import MitraList from '../modules/mitra/MitraList';
import MitraDetail from '../modules/mitra/MitraDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="sales">
          <Route path="orders" element={<SalesOrderList />} />
          <Route path="orders/new" element={<SalesOrderForm />} />
          <Route path="orders/:id/edit" element={<SalesOrderForm />} />
          <Route path="products" element={<ProductList />} />
        </Route>
        <Route path="kolam">
          <Route index element={<KolamList />} />
          <Route path="new" element={<KolamForm />} />
          <Route path=":id" element={<KolamDetail />} />
          <Route path=":id/edit" element={<KolamForm />} />
        </Route>
        <Route path="pakan">
          <Route index element={<PakanStock />} />
          <Route path="purchase" element={<PurchaseForm />} />
          <Route path="suppliers" element={<SupplierList />} />
        </Route>
        <Route path="fleet">
          <Route index element={<VehicleList />} />
          <Route path="monitor" element={<FleetMonitor />} />
          <Route path="new" element={<VehicleForm />} />
          <Route path=":id" element={<VehicleDetail />} />
          <Route path=":id/edit" element={<VehicleForm />} />
        </Route>
        <Route path="karyawan">
          <Route index element={<KaryawanList />} />
          <Route path="new" element={<KaryawanForm />} />
          <Route path=":id/edit" element={<KaryawanForm />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="lembur" element={<LemburPage />} />
        </Route>
        <Route path="mitra">
          <Route index element={<MitraList />} />
          <Route path=":id" element={<MitraDetail />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
