import * as authLogin from "../controllers/auth.login";
import express from "express";

const router = express.Router();

router.post("/login", authLogin.login);

router.post('/forgotPassword', authLogin.forgotPassword);

router.post('/resetPassword/:hash', authLogin.resetPassword)

export default router;