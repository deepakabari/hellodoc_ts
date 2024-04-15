import {
    providerController,
    schedulingController,
} from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import {
    RequestSchema,
    ShiftSchema,
    UserSchema,
} from '../../../validations/index';
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
        { name: 'independentContract' },
        { name: 'backgroundCheck' },
        { name: 'hipaaCompliance' },
        { name: 'nonDisclosureAgreement' },
        { name: 'licenseDoc' },
    ]),
    celebrate(UserSchema.editPhysicianProfile),
    providerController.editPhysicianProfile,
);

router.patch(
    '/updateNotification',
    isAuth,
    celebrate(UserSchema.updateNotification),
    providerController.updateNotification,
);

router.post(
    '/addNewShift',
    isAuth,
    celebrate(ShiftSchema.createShift),
    schedulingController.addNewShift,
);

router.get('/viewShift/:id', isAuth, schedulingController.viewShift);

router.get('/location', isAuth, providerController.providerLocation);

router.get('/viewShiftFilter', isAuth, schedulingController.viewShiftFilter);

router.get(
    '/unApprovedShift',
    isAuth,
    schedulingController.unApprovedViewShift,
);

router.put('/approveShift', isAuth, schedulingController.approveShift);

router.patch('/editShift/:id', isAuth, schedulingController.editShift);

router.patch(
    '/toggleApproval/:id',
    isAuth,
    schedulingController.toggleShiftApproval,
);

router.delete('/deleteShift', isAuth, schedulingController.deleteShift);

router.delete('/deleteProvider/:id', isAuth, providerController.deleteAccount);

export default router;
