import { Outlet, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';

const RootLayout = () => {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const navigate = useNavigate();

  if (!me) {
    navigate('/auth/login');
    return null;
  }
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
