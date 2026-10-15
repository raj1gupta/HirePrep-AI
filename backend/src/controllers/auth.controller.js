import userModel from "../models/user.model.js";
import tokenBlacklistModel from "../models/blacklist.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @route POST /api/auth/register
 * @description Register a new user, expects username, email and password
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, password, email } = req.body || {};

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(201).json({
            message: "new user created successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message || "Registration failed" });
    }
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Login failed" });
    }
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: error.message || "Logout failed" });
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ message: error.message || "Failed to fetch user details" });
    }
}

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};

export default {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};