/* functions to call backend routes endpoints (login, register, logout)*/ 

import axios from 'axios';
import type { LoginFormData, RegistrationFormData } from './validation';

// store this in a .env file for security
const API_URL = 'http://localhost:8000/api/auth';

/**
 * Sends a login request to the backend.
 */
export const loginUser = async (data: LoginFormData) => {
  const response = await axios.post(`${API_URL}/login`, data);
  // If the backend sends back a token, store it
  if (response.data.access_token) {
    localStorage.setItem('authToken', response.data.access_token);
  }
  return response.data;
};

/**
 * Sends a registration request to the backend.
 */
export const registerUser = async (data: RegistrationFormData) => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};