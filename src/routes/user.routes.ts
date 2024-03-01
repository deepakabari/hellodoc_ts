import userController from "../controllers/user.controller";
import express from "express";

const router = express.Router();

router.post("/createUser", userController.createUser);

router.get("/emailFound", userController.isEmailFound);

router.post("/createRequest", userController.createRequest);

export default router;
