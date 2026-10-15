import axios from 'axios';

const api = axios.create({
  baseURL: '/api/user',
  withCredentials: true,
});

export const productsApi = axios.create({
  baseURL: '/api/products',
  withCredentials: true,
});

export const wishlistApi = axios.create({
  baseURL: '/api/wishlist',
  withCredentials: true,
});

export const cartApi = axios.create({
  baseURL: '/api/cart',
  withCredentials: true,
});

export const ordersApi = axios.create({
  baseURL: '/api/orders',
  withCredentials: true,
});

export default api;
