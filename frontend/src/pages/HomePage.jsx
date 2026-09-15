import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../services/userApi';
import { useLogoutMutation } from '../services/authApi';
import { setCredentials } from '../store/authSlice';
import { baseApi } from '../services/baseApi';
import { Link, useNavigate } from 'react-router';

const HomePage = () => {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setCredentials(null));
      dispatch(baseApi.util.resetApiState());
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isMeLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {me.name}</h1>
      <button onClick={() => handleLogout()}>Logout</button>
      <br />
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
};

export default HomePage;
