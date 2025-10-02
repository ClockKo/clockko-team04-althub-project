import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
function getToken() {
  return localStorage.getItem('authToken') || '';
}

export async function updateUserProfile({ name, avatar }: { name?: string; avatar?: string }) {
  const token = getToken();
  if (!token) throw new Error('You must be logged in to update your profile.');

  const payload: any = {};
  if (name !== undefined) payload.name = name;
  if (avatar !== undefined) payload.avatar = avatar;

  try {
    const res = await axios.put(`${API_BASE_URL}/api/users/profile`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data;
  } catch (e: any) {
    if (axios.isAxiosError(e) && e.response?.data?.message) {
      throw new Error(e.response.data.message);
    }
    throw new Error('Failed to update profile');
  }
}
