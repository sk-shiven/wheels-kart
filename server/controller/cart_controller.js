import User from '../model/user_model.js';
import { Product } from '../model/product_model.js';

export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'cart.product',
            select: 'name price category image stock'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Filter out any items where the product reference no longer exists
        const validCart = (user.cart || []).filter(item => item.product !== null);
        if (validCart.length !== (user.cart || []).length) {
            user.cart = validCart;
            await user.save();
        }

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        console.error('getCart error: ', error);
        res.status(500).json({ success: false, message: 'Server error while fetching cart' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.cart) {
            user.cart = [];
        }

        const cartItemIndex = user.cart.findIndex(
            item => item.product && item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            const nextQuantity = user.cart[cartItemIndex].quantity + 1;
            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Available stock is ${product.stock}`
                });
            }
            user.cart[cartItemIndex].quantity = nextQuantity;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is currently out of stock'
                });
            }
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();

        const updatedUser = await User.findById(userId).populate({
            path: 'cart.product',
            select: 'name price category image stock'
        });

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: updatedUser.cart
        });
    } catch (error) {
        console.error('addToCart error: ', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        res.status(500).json({ success: false, message: 'Server error while adding to cart' });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be an integer of at least 1'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (parsedQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Quantity exceeds available stock of ${product.stock}`
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const cartItem = user.cart.find(
            item => item.product && item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        cartItem.quantity = parsedQuantity;
        await user.save();

        const updatedUser = await User.findById(userId).populate({
            path: 'cart.product',
            select: 'name price category image stock'
        });

        res.status(200).json({
            success: true,
            message: 'Cart quantity updated',
            cart: updatedUser.cart
        });
    } catch (error) {
        console.error('updateCartQuantity error: ', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        res.status(500).json({ success: false, message: 'Server error while updating cart' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const exists = user.cart.some(
            item => item.product && item.product.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        user.cart = user.cart.filter(
            item => item.product && item.product.toString() !== productId
        );
        await user.save();

        const updatedUser = await User.findById(userId).populate({
            path: 'cart.product',
            select: 'name price category image stock'
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: updatedUser.cart
        });
    } catch (error) {
        console.error('removeFromCart error: ', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        res.status(500).json({ success: false, message: 'Server error while removing from cart' });
    }
};
