import User from "../models/user.js";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
        // Verify JWT token from cookies
        const token = req.cookies.token;
        if(!token) return res.status(httpStatus.UNAUTHORIZED).json({ message:"Token not provided"});

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(httpStatus.UNAUTHORIZED).json({ message:"Invalid token"});

        // Fetch user and attach to req
        const user = await User.findById(decoded.id).select("-password");
        if(!user) return res.status(httpStatus.NOT_FOUND).json({ message:"User not found"});

        req.user = user;
        next();
    } catch (error) {
        console.log("error in authMiddleware middleware");
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export default authMiddleware;