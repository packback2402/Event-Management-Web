import jwt, { Secret } from "jsonwebtoken";

export const generateToken = (id: string): string => {
    const secret: Secret = process.env.JWT_SECRET || "default_secret";
    return jwt.sign({ id }, secret, { expiresIn: "7d" });
};