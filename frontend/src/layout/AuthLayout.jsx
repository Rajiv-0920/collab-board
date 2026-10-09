import { Outlet, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';
import { useEffect } from 'react';
import PageLoader from '../components/utils/PageLoader';

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
    return <PageLoader />;
  }

  if (isMeSuccess) {
    return <PageLoader text="Redirecting..." />;
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="grid min-h-svh place-items-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
