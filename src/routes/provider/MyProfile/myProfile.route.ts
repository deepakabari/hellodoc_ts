import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerProfile } from '../../../controllers';
import { celebrate } from 'celebrate';
import { ProviderSchema } from '../../../validations';

const router = express.Router();

router.post(
    '/requestToAdmin/:id',
    isAuth,
    celebrate(ProviderSchema.myProfile),
    providerProfile.requestToAdmin,
);

export default router;
