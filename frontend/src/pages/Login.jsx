import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import LoginForm from '../components/auth/LoginForm';
import { useEffect } from 'react';
import { toast } from '@/components/ui/toast';

const Login = () => {
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    const logoutMessage = sessionStorage.getItem('logout_message');
    if (logoutMessage) {
      sessionStorage.removeItem('logout_message'); // Clear it so it doesn't repeat on refresh
      toast.add({
        type: 'success',
        description: logoutMessage,
      });
    }
  }, []);

  return <div>{!currentUser && <LoginForm />}</div>;
};

export default Login;
