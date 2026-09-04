import User from "../model/user_model.js";
import generateToken from '../utils/generateToken.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try{
        const {fullName, email, password, phone} = req.body;
        if(!fullName || !email || !password || !phone){
            return res.status(400).json({message: 'All fields mandatory'});
        }
        if(password.length < 6 || fullName.length < 6){
            return res.status(400).json({message: "Field length should be greater than 6"});
        }
        const userExists = await User.findOne({ $or: [{ fullName }, { email }] });
        if(userExists){
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(42);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({fullName, email, phone, password: hashedPassword});
        const userResponse = user.toObject();
        delete userResponse.password;

        generateToken(res, user._id);
        return res.status(201).json({message: "Successfully registered"});
    }
    catch(error){
        console.error('Internal Server Error: ', error);
        return res.status(500).json({message: 'Internal server error'})
    }
};

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found, register first" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(res, user._id);
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ message: "Login successful", user: userResponse });
    }
    catch(error){
        console.error('Internal Server Error: ', error);
        return res.status(500).json({message: 'Internal server error'})
    }
};

export const logoutUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found, register first" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    }
    catch(error){
        console.error('Internal Server Error: ', error);
        return res.status(500).json({message: 'Internal server error'})
    }
};

export const getMe = async (req, res) => {
    try{
        const {email, password} = req.body;

    }
    catch(error){
        console.error('Internal Server Error: ', error);
        return res.status(500).json({message: 'Internal server error'})
    }
};

export const changeUserPassword = async (req, res) => {
    try{
        const {email, password} = req.body;

    }
    catch(error){
        console.error('Internal Server Error: ', error);
        return res.status(500).json({message: 'Internal server error'})
    }
};