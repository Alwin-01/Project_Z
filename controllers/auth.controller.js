import User from "../models/user.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    // check required fields
    if (!username || !email || !password)
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, { // Set cookie
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Respond with user data
        res.status(httpStatus.CREATED).json({
            success: true, message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log("error in Register controller");
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// login
export const login = async (req, res) => {
    const { email, password } = req.body;
    // Check required fields
    if (!email || !password)
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(httpStatus.OK).json({
            success: true, message: "Login successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log("error in login controller");
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// logout
export const logout = (req, res) => {
    try {
        // Clear the cookie for logout
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(httpStatus.OK).json({ message: "Logout successfully" })
    } catch (error) {
        console.log("error in logout controller");
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};