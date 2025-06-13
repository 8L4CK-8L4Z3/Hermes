import bcrypt from "bcrypt";
import { asyncHandler } from "./responses.js";

export const hashPassword = asyncHandler(async (password) => {
  return await bcrypt.hash(password, 10);
});

export const verifyPassword = asyncHandler(async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
});
