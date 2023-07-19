import { Router } from 'express';
import sessionsController from '../controllers/session.controller.js';
import { registerValidations, loginValidations, passportRegister, passportLogIn, passportGitHubAuth, passportGitHubCallback } from '../middlewares/auth.js';

const sessionRouter = Router();

sessionRouter.post('/register', registerValidations, passportRegister, sessionsController.register);
sessionRouter.post('/login', loginValidations, passportLogIn, sessionsController.login);
sessionRouter.get('/logout', sessionsController.logout);
sessionRouter.get('/github', passportGitHubAuth);
sessionRouter.get('/githubcallback', passportGitHubCallback, sessionsController.githubCallback);
sessionRouter.get('/current', sessionsController.getCurrent);

export default sessionRouter;
