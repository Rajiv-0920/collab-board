import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../services/authApi';
import { selectCurrentUser, setCredentials } from '../store/authSlice';
import { Link } from 'react-router';

const LoginPage = () => {
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
      {!currentUser && (
        <>
          <h2>Login Form</h2>
          <form onSubmit={handleSubmit}>
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
            <button type="submit" disabled={isLoading}>
              Login
            </button>
          </form>
        </>
      )}
      {isError && <p>Login failed.</p>}
      <p>
        New <Link to="/auth/register">register</Link>
      </p>
    </div>
  );
};

export default LoginPage;
