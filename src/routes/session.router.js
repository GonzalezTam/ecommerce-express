import { Router } from 'express';
import sessionsController from '../controllers/session.controller.js';
import { registerValidations, loginValidations, passportRegister, passportLogIn, passportGitHubAuth, passportGitHubCallback } from '../middlewares/auth.js';

const router = Router();

router.post('/register', registerValidations, passportRegister, sessionsController.register);
router.post('/login', loginValidations, passportLogIn, sessionsController.login);
router.get('/logout', sessionsController.logout);
router.get('/github', passportGitHubAuth);
router.get('/githubcallback', passportGitHubCallback, sessionsController.githubCallback);
router.get('/current', sessionsController.getCurrent);

export default router;
