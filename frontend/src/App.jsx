import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import AuthLayout from './layout/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Error from './pages/Error';
import RootLayout from './layout/RootLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Profile from './pages/Profile';
import ProtectedRoute from './layout/ProtectedRoute';
import Invitations from './pages/Invitations';
import Boards from './pages/Boards';
import SettingsPage from './pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <Error />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'boards',
            element: <Boards />,
          },
          {
            path: 'boards/:boardId',
            element: <Board />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'invitations',
            element: <Invitations />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'register', element: <Register /> },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
  {
    path: '*',
    element: <Error />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
