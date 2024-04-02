import userController from '../../controllers/User/user.controller';
import express from 'express';
import { RequestSchema, UserSchema } from '../../validations/index';
import { celebrate } from 'celebrate';
import { upload } from '../../utils/multerConfig';
import isAuth from '../../middleware/in-auth'

const router = express.Router();

router.post(
    '/createUser',
    upload.array('files'),
    celebrate(UserSchema.createUser),
    userController.createAccount,
);

router.get(
    '/emailFound',
    celebrate(UserSchema.isEmailFound),
    userController.isEmailFound,
);

router.post(
    '/createRequest',
    upload.single('document'),
    celebrate(RequestSchema.createRequest),
    userController.createRequest,
);

router.post('/createAdminRequest', isAuth, celebrate(RequestSchema.createRequest), userController.createAdminRequest)

export default router;
