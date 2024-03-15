import { partnerController } from "../../../controllers/index";
import express from "express";
import isAuth from "../../../middleware/in-auth";
import { celebrate } from "celebrate";
import { BusinessSchema } from "../../../validations/index";
const router = express.Router();

router.post(
    "/addBusiness",
    isAuth,
    celebrate(BusinessSchema.createBusiness),
    partnerController.addBusiness
);

export default router;
