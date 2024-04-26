import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerProfile } from '../../../controllers';
import { celebrate } from 'celebrate';
import { ProviderSchema } from '../../../validations';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.post(
    '/requestToAdmin/:id',
    isAuth,
    verifyRole(['MyProfile']),
    celebrate(ProviderSchema.myProfile),
    providerProfile.requestToAdmin,
);

export default router;
