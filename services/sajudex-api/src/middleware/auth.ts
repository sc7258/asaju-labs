import { Request, Response, NextFunction } from 'express';

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.SAJUDEX_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    return;
  }
  next();
};
