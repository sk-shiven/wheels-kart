import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controller/wishlist_controller.js';
import { isAuthenticated } from '../middleware/auth_middleware.js';

const router = express.Router();

router.get('/', isAuthenticated, getWishlist);
router.post('/:productId', isAuthenticated, addToWishlist);
router.delete('/:productId', isAuthenticated, removeFromWishlist);

export default router;
