import jwt from 'jsonwebtoken'
import User from '../model/user_model.js'

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not Authorized, token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found, token invalid" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error: ", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};