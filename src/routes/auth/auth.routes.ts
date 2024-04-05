import { UserSchema } from '../../validations/index';
import * as authLogin from '../../controllers/Auth/auth.login';
import express from 'express';
import { celebrate } from 'celebrate';
import isAuth from '../../middleware/in-auth';

const router = express.Router();

router.post('/login', celebrate(UserSchema.login), authLogin.login);

router.post(
    '/forgotPassword',
    celebrate(UserSchema.forgotPassword),
    authLogin.forgotPassword,
);

router.post(
    '/resetPassword/:hash',
    celebrate(UserSchema.resetPassword),
    authLogin.resetPassword,
);

router.post(
    '/changePassword/:id',
    isAuth,
    celebrate(UserSchema.changePassword),
    authLogin.changePassword,
);

export default router;
