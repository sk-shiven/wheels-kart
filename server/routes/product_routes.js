import express from 'express';
import { createProduct, getProducts, getProductById } from '../controller/product_controller.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
