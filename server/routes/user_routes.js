import express from 'express'
import { loginUser, logoutUser, registerUser, getMe, changeUserPassword } from '../controller/user_controller.js';
import { isAuthenticated } from '../middleware/auth_middleware.js'
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/getMe', isAuthenticated, getMe);
router.patch('/change-password', changeUserPassword);
export default router;