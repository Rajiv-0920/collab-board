import { Outlet, ScrollRestoration, useNavigate } from 'react-router';
import { useGetMeQuery } from '../services/userApi';
import { useEffect } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';
import { Toaster } from '@/components/ui/toast';
import PageLoader from '@/components/utils/PageLoader';

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
    return <PageLoader />;
  }

  // If there's no user after loading, render nothing while useEffect handles the redirect
  if (!me) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="shrink-0">
          <AppHeader />
        </div>

        {/* Main content area */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-6">
          <Outlet />
        </main>
        <Toaster />
        <ScrollRestoration />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayout;
