import User from "../models/user.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // Import mongoose

// In-memory user storage for development
let inMemoryUsers = [];

// Check if User model is available
const isUserModelAvailable = () => {
    try {
        // Check if User model exists and MongoDB is connected
        return User && typeof User.findOne === 'function' && mongoose.connection.readyState === 1;
    } catch (error) {
        console.log("User model not available:", error.message);
        return false;
    }
};

// register
export const register = async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { username, email, password } = req.body;

    // check required fields
    if (!username || !email || !password)
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });

    try {
        let user;
        
        // Check if User model is available (MongoDB connection)
        if (isUserModelAvailable()) {
            console.log("Using MongoDB for user registration");
            // Use MongoDB
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser)
                return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ username, email, password: hashedPassword });
            await user.save();
        } else {
            console.log("Using in-memory storage for user registration");
            // Use in-memory storage
            const existingUser = inMemoryUsers.find(u => u.email === email || u.username === username);
            if (existingUser)
                return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            user = {
                _id: Date.now().toString(),
                username,
                email,
                password: hashedPassword
            };
            inMemoryUsers.push(user);
        }

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        // Set cookie
        res.cookie('token', token, { // Set cookie
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Respond with user data
        res.status(httpStatus.CREATED).json({
            success: true, 
            message: "User registered successfully",
            token, // Include token in response for localStorage
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log("error in Register controller:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: error.message || "Registration failed. Please try again." 
        });
    }
};

// login
export const login = async (req, res) => {
    const { email, password } = req.body;
    // Check required fields
    if (!email || !password)
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });

    try {
        let user;
        
        // Find user by email
        if (isUserModelAvailable()) {
            console.log("Using MongoDB for user login");
            // Use MongoDB
            user = await User.findOne({ email });
        } else {
            console.log("Using in-memory storage for user login");
            // Use in-memory storage
            user = inMemoryUsers.find(u => u.email === email);
        }
        
        if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });

        // JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Respond with user data
        res.status(httpStatus.OK).json({
            success: true, 
            message: "Login successfully",
            token, // Include token in response for localStorage
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log("error in login controller:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: error.message || "Login failed. Please try again." 
        });
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
        // Respond successfully
        res.status(httpStatus.OK).json({ message: "Logout successfully" })
    } catch (error) {
        console.log("error in logout controller");
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};