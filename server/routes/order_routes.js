import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} from '../controller/order_controller.js';
import { isAuthenticated } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/create-payment-order', isAuthenticated, createPaymentOrder);
router.post('/create-order', isAuthenticated, createPaymentOrder);
router.post('/verify-payment', isAuthenticated, verifyPayment);
router.get('/', isAuthenticated, getUserOrders);
router.get('/:id', isAuthenticated, getOrderById);
router.patch('/:id/status', isAuthenticated, updateOrderStatus);

export default router;
