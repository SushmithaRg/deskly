import type { Request, Response } from "express";

export default function handler(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: "Vercel API function is working"
  });
}