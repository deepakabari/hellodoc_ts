import {
    providerController,
    schedulingController,
} from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RequestSchema, ShiftSchema, UserSchema } from '../../../validations/index';
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

router.post('/addNewShift', isAuth, celebrate(ShiftSchema.createShift), schedulingController.addNewShift);

router.get('/viewShift/:id', isAuth, schedulingController.viewShift);

router.get('/location', isAuth, providerController.providerLocation)

router.get('/viewShiftFilter', isAuth, schedulingController.viewShiftFilter)

router.get('/unApprovedShift', isAuth, schedulingController.unApprovedViewShift)

router.put('/approveShift', isAuth, schedulingController.approveShift)

router.delete('/deleteShift', isAuth, schedulingController.deleteShift)

export default router;
