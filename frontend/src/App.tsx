import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuth } from './modules/auth/authSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
