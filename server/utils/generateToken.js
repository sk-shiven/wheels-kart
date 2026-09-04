import jwt from 'jsonwebtoken';

export default generateToken = (res, userID) => {
    const token = jwt.sign({id : userID}, process.env.JWT_SECRET, {expiresIn : '15d'})   
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV = 'production', 
        sameSite: 'strict',
        maxAge: 15*24*68*60*1000
    });
    return token
}