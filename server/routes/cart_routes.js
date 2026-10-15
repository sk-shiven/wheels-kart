import express from 'express';
import {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart
} from '../controller/cart_controller.js';
import { isAuthenticated } from '../middleware/auth_middleware.js';

const router = express.Router();

router.get('/', isAuthenticated, getCart);
router.post('/:productId', isAuthenticated, addToCart);
router.patch('/:productId', isAuthenticated, updateCartQuantity);
router.delete('/:productId', isAuthenticated, removeFromCart);

export default router;
