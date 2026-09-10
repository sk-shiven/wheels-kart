import User from "../model/user_model.js";
import generateToken from '../utils/generateToken.js';
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields mandatory' });
        }
        
        const phoneStr = String(phone).trim();

        if (password.length < 6 || fullName.length < 3) {
            return res.status(400).json({ message: "Field length requirements not met" });
        }
        const userExists = await User.findOne({ $or: [{ fullName }, { email }, { phone: phoneStr }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ fullName, email, phone: phoneStr, password: hashedPassword });

        const userResponse = user.toObject();
        delete userResponse.password;

        generateToken(res, user._id);
        return res.status(201).json({ message: "Successfully registered", user: userResponse });
    } catch (error) {
        console.error('Registration Error: ', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email, phone, or name already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found, register first" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(res, user._id);
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ message: "Login successful", user: userResponse });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const userResponse = req.user.toObject ? req.user.toObject() : { ...req.user };
        delete userResponse.password;

        return res.status(200).json({ user: userResponse });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const changeUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, email } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        // Identify the user: from authenticated session (req.user) or email in request body
        const userId = req.user?._id;
        let user;

        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            user = await User.findOne({ email });
        } else {
            return res.status(400).json({ message: "User identification (session or email) is required" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the old password against the stored bcrypt hash
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        // Prevent reusing the exact same password
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be identical to the old password" });
        }

        // Generate salt and hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update and save
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};