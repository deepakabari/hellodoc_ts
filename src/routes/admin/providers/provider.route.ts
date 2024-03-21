import {
    providerController,
    schedulingController,
} from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RequestSchema, UserSchema } from '../../../validations/index';
import { upload } from '../../../utils/multerConfig';

const router = express.Router();

router.get(
    '/providerInformation',
    isAuth,
    providerController.providerInformation,
);

router.post('/contactProvider/:id', isAuth, providerController.contactProvider);

router.get(
    '/physicianProfile/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    providerController.physicianProfileInAdmin,
);

router.get('/providerOnCall', isAuth, schedulingController.providerOnCall);

router.patch(
    '/providerProfile/:id',
    isAuth,
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
    ]),
    celebrate(UserSchema.editPhysicianProfile),
    providerController.editPhysicianProfile,
);

router.post('/addNewShift', isAuth, schedulingController.addNewShift);

router.get('/viewShift/:id', isAuth, schedulingController.viewShift);

export default router;
