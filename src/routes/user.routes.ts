import userController from "../controllers/user.controller";
import express from "express";
import { RequestSchema, UserSchema } from "../db/models";
import { celebrate } from "celebrate";

const router = express.Router();

router.post("/createUser", celebrate(UserSchema.createUser), userController.createUser);

router.get("/emailFound", celebrate(UserSchema.isEmailFound), userController.isEmailFound);

router.post("/createRequest", celebrate(RequestSchema.createRequest), userController.createRequest);

export default router;
