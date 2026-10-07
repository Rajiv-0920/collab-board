import { Outlet, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';
import { useEffect } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';

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
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayout;
