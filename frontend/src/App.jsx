import { useState } from 'react';
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from './services/authApi';
import { setCredentials } from './store/authSlice';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from './services/userApi';
import { useEffect } from 'react';
import { baseApi } from './services/baseApi';

const App = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [login, { isLoading, isError }] = useLoginMutation();
  const [
    register,
    {
      isLoading: isRegisterLoading,
      isError: isRegisterError,
      isSuccess: isRegisterSuccess,
    },
  ] = useRegisterMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (me) {
      dispatch(setCredentials(me));
    }
  }, [me, dispatch]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(user).unwrap();
    } catch (err) {
      console.error('Register failed:', err);
    } finally {
      setUser({ name: '', email: '', password: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // .unwrap() extracts the actual payload data when the promise resolves
      const userData = await login(user).unwrap();

      // Now userData is a plain, serializable object!
      dispatch(setCredentials(userData));
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setUser({ email: '', password: '' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setCredentials(null));
      dispatch(baseApi.util.resetApiState());
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isMeLoading) return <p>Loading...</p>;

  if (me)
    return (
      <>
        <h1>Welcome, {me.name}</h1>
        <button onClick={handleLogout} disabled={isLogoutLoading}>
          Logout
        </button>
      </>
    );

  return (
    <div>
      {!me && (
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
            <button type="submit" disabled={isLoading}>
              Submit
            </button>
          </form>
          {isRegisterSuccess && <p>Registration successful.</p>}
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
              Submit
            </button>
          </form>
        </>
      )}
      {isError && <p>Login failed.</p>}
    </div>
  );
};

export default App;
