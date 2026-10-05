import axios from 'axios';

const api = axios.create({
  baseURL: '/api/user',
  withCredentials: true,
});

export const productsApi = axios.create({
  baseURL: '/api/products',
  withCredentials: true,
});

export default api;
