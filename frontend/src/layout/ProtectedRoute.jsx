import { Navigate, Outlet, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '@/services/userApi';

const ProtectedRoute = () => {
  const { data: me, isLoading } = useGetMeQuery();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user && !isLoading) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
