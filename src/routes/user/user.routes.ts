import userController from '../../controllers/User/user.controller';
import express from 'express';
import { RequestSchema, UserSchema } from '../../validations/index';
import { celebrate } from 'celebrate';
import { upload } from '../../utils/multerConfig';
import isAuth from '../../middleware/in-auth';
import verifyRole from '../../middleware/verifyRole';

const router = express.Router();

router.post(
    '/createUser',
    upload.fields([
        { name: 'photo' },
        { name: 'independentContract' },
        { name: 'backgroundCheck' },
        { name: 'hipaaCompliance' },
        { name: 'nonDisclosureAgreement' },
    ]),
    isAuth,
    verifyRole(['Accounts']),
    celebrate(UserSchema.createUser),
    userController.createAccount,
);

router.post(
    '/createPatient',
    celebrate(UserSchema.createPatient),
    userController.createPatient,
);

router.post(
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

router.post(
    '/createAdminRequest',
    upload.single('document'),
    isAuth,
    celebrate(RequestSchema.createRequest),
    userController.createAdminRequest,
);

export default router;
