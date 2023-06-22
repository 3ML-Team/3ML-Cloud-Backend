import { Router } from 'express';
import PasswordResetController from '../controller/passwordOperationsController';

const passwordResetRouter = Router();

passwordResetRouter.post('/request-password-reset', PasswordResetController.requestPasswordReset);
passwordResetRouter.get('/validate-reset-token', PasswordResetController.validateResetToken);
passwordResetRouter.post('/submit-new-password', PasswordResetController.submitNewPassword);

export default passwordResetRouter;
