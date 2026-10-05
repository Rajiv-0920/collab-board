import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../services/authApi';
import { selectCurrentUser, setCredentials } from '../store/authSlice';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [login, { isLoading, isError }] = useLoginMutation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(user).unwrap();

      dispatch(setCredentials(userData));
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setUser({ email: '', password: '' });
    }
  };

  return (
    <div>
      {!currentUser && <LoginForm />}
      {isError && <p>Login failed.</p>}
    </div>
  );
};

export default Login;
