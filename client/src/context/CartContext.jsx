import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { cartApi } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartApi.get('/');
      setCartItems(response.data.cart || []);
    } catch (err) {
      // If 401 (not logged in), set cart to empty without loud error
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        console.error('Failed to fetch cart:', err);
        setError(err.response?.data?.message || 'Unable to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const response = await cartApi.post(`/${productId}`);
      setCartItems(response.data.cart || []);
      return { success: true, message: response.data.message || 'Added to cart' };
    } catch (err) {
      console.error('Add to cart error:', err);
      const message = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message, status: err.response?.status };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartApi.patch(`/${productId}`, { quantity });
      setCartItems(response.data.cart || []);
      return { success: true, message: response.data.message || 'Quantity updated' };
    } catch (err) {
      console.error('Update quantity error:', err);
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message, status: err.response?.status };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartApi.delete(`/${productId}`);
      setCartItems(response.data.cart || []);
      return { success: true, message: response.data.message || 'Removed from cart' };
    } catch (err) {
      console.error('Remove from cart error:', err);
      const message = err.response?.data?.message || 'Failed to remove item from cart';
      return { success: false, message, status: err.response?.status };
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  // Derived state: total units count
  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  // Derived state: subtotal in INR
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    subtotal,
    totalUnits,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartState,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
