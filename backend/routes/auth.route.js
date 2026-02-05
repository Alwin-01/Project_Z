import express from "express";
import {login, register, logout} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Register, login, and logout routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export default authRouter;