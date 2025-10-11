import axios from 'axios';
export interface UserProfileUpdateParams {
  name?: string;
  avatar?: string | null;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  is_verified: boolean;
  is_active: boolean;
  otp_verified: boolean;
}

// Normalize API base to include /api once
const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '');
function getToken() {
  return localStorage.getItem('authToken') || '';
}

export async function updateUserProfile({ name, avatar }: { name?: string; avatar?: string | null }) {
  const token = getToken();
  if (!token) throw new Error('You must be logged in to update your profile.');

  const payload: any = {};
  if (name !== undefined) payload.name = name;
  if (avatar !== undefined) {
    payload.avatar_url = avatar;
    console.log('Setting avatar_url to:', avatar);
  }

  // Validate payload has required fields
  if (Object.keys(payload).length === 0) {
    throw new Error('No fields to update');
  }

  console.log('Sending profile update with payload:', payload);

  try {
    // Update profile using auth endpoint for consistency
    const res = await axios.put(`${API_BASE_URL.replace(/\/api$/, '')}/api/auth/user`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log('Profile update response:', res.data);
    return res.data;
  } catch (e: any) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message);
    }
    throw new Error('Failed to update profile');
  }
}
