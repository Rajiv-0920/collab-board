import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const currentUser = useSelector(selectCurrentUser);

  return <div>{!currentUser && <LoginForm />}</div>;
};

export default Login;
