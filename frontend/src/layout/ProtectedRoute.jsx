import { Navigate, Outlet, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
