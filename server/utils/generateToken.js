import jwt from 'jsonwebtoken';

const generateToken = (res, userID) => {
    const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: '15d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
    });
    return token;
};

export default generateToken;