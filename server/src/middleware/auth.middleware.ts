import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "JWT configuration error",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch (error) {
  console.error("JWT verification failed:", error);

  res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });
}
};

export default protect;