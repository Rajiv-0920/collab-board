import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterMutation } from '../services/authApi';
import { selectCurrentUser } from '../store/authSlice';
import { useSelector } from 'react-redux';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const currentUser = useSelector(selectCurrentUser);
  return <div>{!currentUser && <RegisterForm />}</div>;
};

export default Register;
