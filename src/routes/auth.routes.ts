import { UserSchema } from "../db/models";
import * as authLogin from "../controllers/auth.login";
import express from "express";
import { celebrate } from "celebrate";

const router = express.Router();

router.post("/login", celebrate(UserSchema.login), authLogin.login);

router.post('/forgotPassword', celebrate(UserSchema.forgotPassword), authLogin.forgotPassword);

router.post('/resetPassword/:hash', celebrate(UserSchema.resetPassword), authLogin.resetPassword)

export default router;