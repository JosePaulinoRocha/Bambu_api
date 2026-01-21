import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/jwtConfig';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, payload) => {
      if (err) {
        console.log('Token inválido o expirado:', err.message);
        return res.sendStatus(403);
      }
      console.log('Payload válido:', payload);
      (req as any).user = payload;
      next();
    });

  } else {
    res.sendStatus(401);
  }
};
