import { Outlet, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';
import { useEffect } from 'react';

const AuthLayout = () => {
  const {
    data: me,
    isLoading: isMeLoading,
    isSuccess: isMeSuccess,
  } = useGetMeQuery();

  const navigate = useNavigate();

  useEffect(() => {
    if (me) {
      navigate('/');
    }
  }, [me, navigate]);

  if (isMeLoading) {
    return <p>Loading...</p>;
  }

  if (isMeSuccess) {
    return <p>Redirecting...</p>;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
