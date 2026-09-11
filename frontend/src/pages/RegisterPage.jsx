import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterMutation } from '../services/authApi';
import { selectCurrentUser } from '../store/authSlice';
import { useSelector } from 'react-redux';

const RegisterPage = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [
    register,
    {
      isLoading: isRegisterLoading,
      isError: isRegisterError,
      isSuccess: isRegisterSuccess,
    },
  ] = useRegisterMutation();

  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(user).unwrap();
      navigate('/auth/login');
    } catch (err) {
      console.error('Register failed:', err);
    } finally {
      setUser({ name: '', email: '', password: '' });
    }
  };

  return (
    <div>
      {!currentUser && (
        <>
          <h2>Register Form</h2>
          <form onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              name="name"
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <input
              type="email"
              name="email"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="password"
              name="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button type="submit" disabled={isRegisterLoading}>
              Register
            </button>
          </form>
          <p>
            New <Link to="/auth/login">login</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
