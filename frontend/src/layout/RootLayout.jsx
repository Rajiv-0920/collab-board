import { Outlet, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';
import { useEffect } from 'react';

const RootLayout = () => {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if loading is finished AND the user is not found
    if (!isMeLoading && !me) {
      navigate('/auth/login');
    }
  }, [me, isMeLoading, navigate]);

  // Show a loading state while RTK Query fetches the user data
  if (isMeLoading) {
    return <div>Loading...</div>;
  }

  // If there's no user after loading, render nothing while useEffect handles the redirect
  if (!me) {
    return null;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
