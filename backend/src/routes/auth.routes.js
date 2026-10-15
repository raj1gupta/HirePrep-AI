// import express from "express"
import { Router } from "express"
import authController from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access public
 */
authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access public
 */
authRouter.post("/login", authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add token in the blacklist
 * @access public 
 * 
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @rout GET /api/auth/get-me
 * @description get the current c=logged in user details
 * @access private
 */

authRouter.get("/get-me", authMiddleware.authUser,authController.getMeController )

export default authRouter