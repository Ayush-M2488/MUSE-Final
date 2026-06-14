import { Router } from 'express';
import { login, updateProfile, forgotPassword, resetPassword, googleSSO, changePassword } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from '../schemas';

const router = Router();

router.post('/login', validateSchema(loginSchema), login);
router.post('/forgot-password', validateSchema(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), resetPassword);
router.post('/sso/google', googleSSO);
router.put('/profile', verifyToken, validateSchema(updateProfileSchema), updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;