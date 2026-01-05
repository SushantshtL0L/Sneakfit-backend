import dotenv from "dotenv";
import { parse } from "path";
dotenv.config();

// application level constant and config
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;

/**
 * Database
 */
export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sneakfit_db";

/**
 * JWT
 */
export const JWT_SECRET: string =
  process.env.JWT_SECRET || "sneakfit_secret";
