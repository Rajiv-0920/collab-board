import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegisterMutation } from '../../services/authApi';
import { selectCurrentUser } from '../../store/authSlice';
import { useSelector } from 'react-redux';
import { Loader2, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const RegisterForm = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [
    register,
    { error, isLoading, isError, isSuccess: isRegisterSuccess },
  ] = useRegisterMutation();
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!user.name) newErrors.name = 'Name is required';

    if (!user.email) newErrors.email = 'Email is required';

    if (!user.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

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
    <Card className="w-full max-w-md border-border/70 shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardList />
        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight">
          Register
        </CardTitle>

        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>

      <CardContent>
        {isError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error?.message ||
              error?.error ||
              'Unable to register. Please try again.'}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              placeholder="Enter your name"
              id="name"
              name="name"
              value={user.name}
              onChange={(e) => {
                setUser({ ...user, name: e.target.value });
                if (error.name)
                  setErrors((prev) => ({ ...prev, name: e.target.value }));
              }}
              aria-invalid={!!errors.email}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              id="email"
              name="email"
              value={user.email}
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: null }));
              }}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              id="password"
              name="password"
              value={user.password}
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: null }));
              }}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
