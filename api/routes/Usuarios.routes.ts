// routes/usuarios.routes.ts
import { Router } from 'express';
import { ObtenerUsuarios, PostUsers, UpdateUser } from '../controllers/Usuarios.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, ObtenerUsuarios);
router.post('/', PostUsers);
router.put('/:id', authenticateJWT, UpdateUser);

export default router;
