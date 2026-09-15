import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import AuthLayout from './layout/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ErrorPage from './pages/ErrorPage';
import RootLayout from './layout/RootLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
