import { myProfileController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RequestSchema } from '../../../validations/index';

const router = express.Router();

router.get(
    '/adminProfile/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    myProfileController.adminProfile,
);

router.patch(
    '/editAdminProfile/:id',
    isAuth,
    myProfileController.editAdminProfile,
);

export default router;
