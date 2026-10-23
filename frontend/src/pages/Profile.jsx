import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, Upload, X } from 'lucide-react';

import { selectCurrentUser } from '../store/authSlice';
import { useUpdateMeMutation } from '../services/userApi';

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
import { toast } from '@/components/ui/toast';
import { avatarInitials } from '@/lib/avatarInitials';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

const Profile = () => {
  const currentUser = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [updateMe, { isLoading: isProfileUpdating }] = useUpdateMeMutation();

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name);
  }, [currentUser?.name]);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const hasChanges =
    Boolean(avatarFile) || name.trim() !== (currentUser?.name ?? '');

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
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

  const handleDiscard = () => {
    setName(currentUser?.name ?? '');
    clearSelectedFile();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (name.trim()) formData.append('name', name.trim());
      if (avatarFile) formData.append('avatarUrl', avatarFile);

      await updateMe(formData).unwrap();

      clearSelectedFile();
      toast.add({
        type: 'success',
        description: 'Profile updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.add({
        type: 'error',
        description: error?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and how others see you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-[280px_1fr]"
      >
        {/* Left: avatar */}
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="size-32 ring-4 ring-muted">
              <AvatarImage
                src={previewUrl ?? currentUser?.avatarUrl}
                alt="Avatar"
              />
              <AvatarFallback className="text-4xl">
                {avatarInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-medium">{currentUser?.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {currentUser?.email}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
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
              <p className="text-xs text-destructive">{fileError}</p>
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

        {/* Right: details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Your name is shown on boards, cards and comments.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
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
              onClick={handleDiscard}
              disabled={!hasChanges || isProfileUpdating}
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || !name.trim() || isProfileUpdating}
            >
              {isProfileUpdating && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {isProfileUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Profile;
