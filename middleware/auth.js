import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const JWT_SECRET = process.env.JWT_SECRET || task

export default async function authMiddleware(req, res, next) {
    // Grab bearer token form auth header

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401)
        .json({success:false,message:"Not Authorized,token missing"})
    }

    const token = authHeader.split(' ')[1];

    //Verify and attach user object

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
        
    } catch (err) {
        console.log("JWT verification failed", err);
        return res.status(401).json({success:false,message:'Token invalid or expired'})
    }
}