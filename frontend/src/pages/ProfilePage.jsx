import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { useUpdateMeMutation } from '../services/userApi';

const ProfilePage = () => {
  const currentUser = useSelector(selectCurrentUser);

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const [updateMe, { isLoading: isProfileUpdating }] = useUpdateMeMutation();

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (name) formData.append('name', name);

      if (avatarFile) {
        formData.append('avatarUrl', avatarFile);
      }

      await updateMe(formData).unwrap();

      setAvatarFile(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="file"
          name="avatarUrl"
          accept="image/jpeg, image/png, image/jpg, image/webp"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />

        <button type="submit" disabled={isProfileUpdating}>
          {isProfileUpdating ? 'Saving...' : 'Save'}
        </button>
      </form>

      <h1>{currentUser?.name}</h1>
      <p>{currentUser?.email}</p>

      <img
        src={currentUser?.avatarUrl}
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'cover',
          borderRadius: '50%',
        }}
        alt="avatar"
      />
    </div>
  );
};

export default ProfilePage;
