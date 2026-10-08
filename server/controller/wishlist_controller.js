import User from '../model/user_model.js';
import { Product } from '../model/product_model.js';

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error("getWishlist error: ", error);
        res.status(500).json({ success: false, message: 'Server error while fetching wishlist' });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Validate productId
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        // Find product to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const user = await User.findById(userId);

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist' });
        }

        // Add to wishlist
        user.wishlist.push(productId);
        await user.save();

        res.status(201).json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error("addToWishlist error: ", error);
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        res.status(500).json({ success: false, message: 'Server error while adding to wishlist' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Validate productId
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const user = await User.findById(userId);

        // Check if in wishlist
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: 'Product not in wishlist' });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error("removeFromWishlist error: ", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        res.status(500).json({ success: false, message: 'Server error while removing from wishlist' });
    }
};