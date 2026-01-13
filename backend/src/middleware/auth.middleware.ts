import jwt from 'jsonwebtoken'
import User from '../models/user.model';
import { NextFunction, Request, Response } from 'express';

interface JWTPayload{
    id:string,
    iat:number,
    exp:number
}

export const protect = async (req:any, res:any, next:any)=>{
    let token = req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1]:undefined;
    if(!token){
        return res.status(401).json({message:"No authourized, no token"});
    } 
    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token,secret) as JWTPayload;
        const user = await User.findById(decoded.id).select("-password");
        if(!user) return res.status(401).json({ message: "User not found" });
        req.user = {id:decoded.id, role:user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
}

export const authorize = (role: "admin"|"user") => {
    return (req:any, res:Response, next:NextFunction) =>{
        if(!req.user||req.user.role !==role) {
            return res.status(403).json({message:"Access Denied"});
        }
        next();
    }
}

export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
}

