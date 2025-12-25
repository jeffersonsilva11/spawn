/**
 * Authentication Middleware
 *
 * Validates shared secret from Backend API.
 */

import { Request, Response, NextFunction } from 'express';

export function authMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const providedSecret = req.headers['x-orchestrator-secret'];

    if (!providedSecret || providedSecret !== secret) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid orchestrator secret',
      });
    }

    next();
  };
}
