import axios from 'axios';
import type { LoginFormData, RegistrationFormData } from './validation';

// store this in a .env file for security
const API_URL = 'http://localhost:8000/api/auth';

/**
 * Sends a login request to the backend.
 */
export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
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
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error) {
    console.error('Registration API call failed:', error);
    throw error;
  }
};

/**
 * Logs the user out by removing the token from storage.
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
};