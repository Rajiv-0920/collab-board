import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { LockKeyhole, ShieldCheck, Loader2, Upload, X } from 'lucide-react';

import { selectCurrentUser } from '../store/authSlice';
import {
  useUpdateMeMutation,
  useChangePasswordMutation,
} from '../services/userApi';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { avatarInitials } from '@/lib/avatarInitials';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

const SettingsPage = () => {
  const currentUser = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);

  // Profile state
  const [name, setName] = useState(currentUser?.name ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [updateMe, { isLoading: isProfileUpdating }] = useUpdateMeMutation();

  // Password state
  const [changePassword, { isLoading: isPasswordUpdating }] =
    useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setName(currentUser?.name ?? '');
  }, [currentUser?.name]);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const hasProfileChanges =
    Boolean(avatarFile) || name.trim() !== (currentUser?.name ?? '');

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Please choose a JPG, PNG or WEBP image.');
      resetFileInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
      resetFileInput();
      return;
    }

    setFileError(null);
    setAvatarFile(file);
  };

  const clearSelectedFile = () => {
    setAvatarFile(null);
    setFileError(null);
    resetFileInput();
  };

  const handleDiscardProfile = () => {
    setName(currentUser?.name ?? '');
    clearSelectedFile();
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.add({
        type: 'error',
        description: 'Name is required.',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);

      if (avatarFile) {
        formData.append('avatarUrl', avatarFile);
      }

      await updateMe(formData).unwrap();

      clearSelectedFile();

      toast.add({
        type: 'success',
        description: 'Profile updated successfully!',
      });
    } catch (error) {
      toast.add({
        type: 'error',
        description: error?.data?.message || 'Failed to update profile.',
      });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.add({
        type: 'error',
        description: 'Please fill in all password fields.',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.add({
        type: 'error',
        description: 'New password must be at least 6 characters.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.add({
        type: 'error',
        description: 'New passwords do not match.',
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast.add({
        type: 'error',
        description: 'New password must differ from your current password.',
      });
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.add({
        type: 'success',
        description: 'Password changed successfully!',
      });
    } catch (error) {
      toast.add({
        type: 'error',
        description: error?.data?.message || 'Failed to change password.',
      });
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          Account settings
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <Separator />

      {/* Profile section */}
      <section id="profile" className="scroll-mt-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your name and profile photo.
          </p>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="grid gap-6 md:grid-cols-[260px_1fr]"
        >
          {/* Avatar card */}
          <Card className="h-fit">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <Avatar className="size-28 ring-4 ring-muted">
                <AvatarImage
                  src={previewUrl ?? currentUser?.avatarUrl}
                  alt={currentUser?.name ?? 'Profile avatar'}
                />
                <AvatarFallback className="text-3xl">
                  {avatarInitials(name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 w-full">
                <p className="truncate font-medium">
                  {currentUser?.name || 'Your account'}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProfileUpdating}
                >
                  <Upload className="mr-2 size-4" />
                  Upload new photo
                </Button>

                {avatarFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    disabled={isProfileUpdating}
                  >
                    <X className="mr-1 size-4" />
                    Discard selection
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                JPG, PNG or WEBP. Max {MAX_FILE_SIZE_MB} MB.
              </p>

              {fileError && (
                <p role="alert" className="text-xs text-destructive">
                  {fileError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Profile details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Your name is shown on boards, cards and comments.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-email">Email address</Label>
                <Input
                  id="settings-email"
                  value={currentUser?.email ?? ''}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Your email can't be changed here.
                </p>
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscardProfile}
                disabled={!hasProfileChanges || isProfileUpdating}
              >
                Discard
              </Button>

              <Button
                type="submit"
                disabled={
                  !hasProfileChanges || !name.trim() || isProfileUpdating
                }
              >
                {isProfileUpdating && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isProfileUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </section>

      {/* Security section */}
      <section id="security" className="scroll-mt-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground">
            Protect your account by keeping your password secure.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </div>

              <div className="space-y-1">
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  Enter your current password and choose a new one.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Use a unique password that you do not use on other websites.
              </p>

              <div className="flex justify-end border-t pt-5">
                <Button
                  type="submit"
                  disabled={
                    isPasswordUpdating ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {isPasswordUpdating && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {isPasswordUpdating ? 'Updating...' : 'Update password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SettingsPage;
