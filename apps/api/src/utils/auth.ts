import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: { sub: string; email: string; name: string }) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d"
  });
}