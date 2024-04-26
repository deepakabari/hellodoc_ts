import {
    providerController,
    schedulingController,
} from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import verifyRole from '../../../middleware/verifyRole';
import { celebrate } from 'celebrate';
import {
    ProviderSchema,
    RequestSchema,
    ShiftSchema,
    UserSchema,
} from '../../../validations/index';
import { upload } from '../../../utils/multerConfig';

const router = express.Router();

router.get(
    '/providerInformation',
    isAuth,
    verifyRole(['Provider']),
    providerController.providerInformation,
);

router.post(
    '/contactProvider/:id',
    isAuth,
    verifyRole(['Provider']),
    celebrate(ProviderSchema.contactProvider),
    providerController.contactProvider,
);

router.get(
    '/physicianProfile/:id',
    isAuth,
    verifyRole(['Provider']),
    celebrate(RequestSchema.idParams),
    providerController.physicianProfileInAdmin,
);

router.get(
    '/providerOnCall',
    isAuth,
    verifyRole(['Provider']),
    schedulingController.providerOnCall,
);

router.patch(
    '/providerProfile/:id',
    isAuth,
    verifyRole(['Provider']),
    upload.fields([
        { name: 'photo' },
        { name: 'signature' },
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
    verifyRole(['Provider']),
    celebrate(ProviderSchema.updateNotification),
    providerController.updateNotification,
);

router.post(
    '/addNewShift',
    isAuth,
    verifyRole(['Scheduling']),
    celebrate(ShiftSchema.createShift),
    schedulingController.addNewShift,
);

router.get(
    '/viewShift/:id',
    isAuth,
    verifyRole(['Scheduling']),
    schedulingController.viewShift,
);

router.get(
    '/viewShiftFilter',
    isAuth,
    verifyRole(['Scheduling']),
    schedulingController.viewShiftFilter,
);

router.get(
    '/unApprovedShift',
    isAuth,
    verifyRole(['Scheduling']),
    schedulingController.unApprovedViewShift,
);

router.put(
    '/approveShift',
    isAuth,
    verifyRole(['Scheduling']),
    celebrate(ShiftSchema.approveShift),
    schedulingController.approveShift,
);

router.patch(
    '/editShift/:id',
    isAuth,
    verifyRole(['Scheduling']),
    celebrate(ShiftSchema.editShift),
    schedulingController.editShift,
);

router.patch(
    '/toggleApproval/:id',
    isAuth,
    verifyRole(['Scheduling']),
    schedulingController.toggleShiftApproval,
);

router.delete(
    '/deleteShift',
    isAuth,
    verifyRole(['Scheduling']),
    celebrate(ShiftSchema.approveShift),
    schedulingController.deleteShift,
);

router.delete('/deleteProvider/:id', isAuth, providerController.deleteAccount);

export default router;
