import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../services/authApi';
import { setCredentials } from '../../store/authSlice';
import { Link } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { Loader2, ClipboardList } from 'lucide-react';

const LoginForm = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: false,
  });
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!user.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!user.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const userData = await login(user).unwrap();
      dispatch(setCredentials(userData));
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/70 shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardList />
        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>

        <CardDescription>Sign in to continue to your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {isError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error?.message ||
              error?.error ||
              'Unable to sign in. Please check your credentials and try again.'}
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={user.email}
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });

                if (errors.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: '',
                  }));
                }
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
              id="password"
              type="password"
              placeholder="••••••••"
              value={user.password}
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });

                if (errors.password) {
                  setErrors((prev) => ({
                    ...prev,
                    password: '',
                  }));
                }
              }}
              aria-invalid={!!errors.password}
            />

            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox
                id="terms-checkbox-basic"
                name="terms-checkbox-basic"
                checked={user.rememberMe}
                onCheckedChange={(checked) =>
                  setUser({ ...user, rememberMe: checked })
                }
              />
              <FieldLabel htmlFor="terms-checkbox-basic">
                Remember me?
              </FieldLabel>
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
