import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
<<<<<<< Updated upstream
import { useRegisterMutation } from '../../services/authApi';
=======
>>>>>>> Stashed changes
import { Loader2, ClipboardList } from 'lucide-react';

import { useRegisterMutation } from '../../services/authApi';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

const RegisterForm = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
<<<<<<< Updated upstream
  const [register, { error, isLoading, isError }] = useRegisterMutation();
=======
>>>>>>> Stashed changes
  const [errors, setErrors] = useState({});

  const [register, { error, isLoading, isError }] = useRegisterMutation();
  const navigate = useNavigate();
<<<<<<< Updated upstream
=======

  const handleChange = (field) => (e) => {
    setUser((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };
>>>>>>> Stashed changes

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!user.name.trim()) newErrors.name = 'Name is required';
    if (!user.email.trim()) newErrors.email = 'Email is required';
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
      setErrors({ error: err.errors[0] });
      console.error('Register failed:', err);
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
            {errors?.error ||
              error?.message ||
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
              onChange={handleChange('name')}
              aria-invalid={!!errors.name}
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
              onChange={handleChange('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              placeholder="Enter your password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleChange('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

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
