import { accessController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RoleSchema } from '../../../validations/index';

const router = express.Router();

router.get('/accountAccess', isAuth, accessController.accountAccess);

router.get(
    '/accountAccessByAccountType',
    isAuth,
    accessController.accountAccessByAccountType,
);

router.post(
    '/createRole',
    isAuth,
    celebrate(RoleSchema.createRole),
    accessController.createRole,
);

router.get('/userAccess', isAuth, accessController.userAccess);

export default router;
