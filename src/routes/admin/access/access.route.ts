import { accessController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RoleSchema } from '../../../validations/index';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/accountAccess',
    isAuth,
    verifyRole(['Role']),
    accessController.accountAccess,
);

router.get(
    '/accountAccessByAccountType',
    isAuth,
    verifyRole(['Role']),
    accessController.accountAccessByAccountType,
);

router.post(
    '/createRole',
    isAuth,
    verifyRole(['Role']),
    celebrate(RoleSchema.createRole),
    accessController.createRole,
);

router.get(
    '/viewRole/:id',
    isAuth,
    verifyRole(['Role']),
    accessController.viewRole,
);

router.patch(
    '/updateRole/:id',
    isAuth,
    verifyRole(['Role']),
    accessController.updateRole,
);

router.get(
    '/userAccess',
    isAuth,
    verifyRole(['Role']),
    accessController.userAccess,
);

router.delete(
    '/deleteRole/:id',
    isAuth,
    verifyRole(['Role']),
    accessController.deleteRole,
);

export default router;
