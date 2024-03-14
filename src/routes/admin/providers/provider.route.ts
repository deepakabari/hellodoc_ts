import {
    providerController,
    schedulingController,
} from "../../../controllers/index";
import express from "express";
import isAuth from "../../../middleware/in-auth";
import { celebrate } from "celebrate";
import { RequestSchema, RoleSchema, UserSchema } from "../../../validations/index";

const router = express.Router();


router.get(
    "/providerInformation",
    isAuth,
    providerController.providerInformation
);

router.get(
    "/physicianProfile/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    providerController.physicianProfileInAdmin
);

router.get("/providerOnCall", isAuth, schedulingController.providerOnCall);

export default router;