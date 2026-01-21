// routes/usuarios.routes.ts
import { Router } from 'express';
import { Login } from '../controllers/Usuarios.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', Login);

export default router;
