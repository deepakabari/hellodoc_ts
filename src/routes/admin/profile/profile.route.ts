import { myProfileController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get(
    '/adminProfile',
    isAuth,
    myProfileController.myProfile,
);

router.patch(
    '/editAdminProfile',
    isAuth,
    myProfileController.editAdminProfile,
);

export default router;
