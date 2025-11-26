import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '@shared/types';

export interface AuthedRequest extends Request {
  user?: Pick<AuthUser, '_id' | 'email' | 'role' | 'name'>;
}

export const requireAuth = (roles: AuthUser['role'][] = []) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    try {
      const token = header.replace('Bearer ', '');
      const decoded = jwt.verify(token, env.jwtSecret) as AuthedRequest['user'];
      req.user = decoded;

      if (roles.length && (!decoded?.role || !roles.includes(decoded.role))) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

