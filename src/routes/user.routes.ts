import * as userController from '../controllers/user.controller'
import express from 'express'
import isAuth from '../middleware/in-auth'

const router = express.Router();

router.post('/createUser', userController.createUser)

router.get('/emailFound', userController.isEmailFound)

router.post('/createRequest', isAuth, userController.createRequest)

export default router;