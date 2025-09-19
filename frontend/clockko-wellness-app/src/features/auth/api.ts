import axios from 'axios';
import type { LoginFormData, RegistrationFormData } from './validation';

// store this in a .env file for security
// const API_URL = 'http://localhost:8000/api/auth';
// const API_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:8000/api'; 

/**
 * Sends a login request to the backend.
 */
export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    // If the backend sends back a token, store it
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Login API call failed:', error);
    // Re-throw the error so the component can handle it (e.g., show an error message)
    throw error;
  }
};

/**
 * Sends a registration request to the backend.
 */
export const registerUser = async (data: RegistrationFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    console.error('Registration API call failed:', error);
    throw error;
  }
};

/**
 * Fetches the current user's data from the backend.
 */
export const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch user data failed:', error);
    // Remove invalid token if the request fails
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Logs the user out by removing the token from storage.
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
};