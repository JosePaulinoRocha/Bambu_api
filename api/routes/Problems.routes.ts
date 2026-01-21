// 1. Nueva ruta problems.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  CrearProblema, ObtenerProblemas, ActualizarProblema, EliminarProblema,
  ObtenerProblemaPorID
} from '../controllers/Problems.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

router.post('/', authenticateJWT, CrearProblema);
router.get('/', authenticateJWT, ObtenerProblemas);
router.patch('/:id', authenticateJWT, ActualizarProblema);
router.delete('/:id', authenticateJWT, EliminarProblema);
router.get('/:id', authenticateJWT, ObtenerProblemaPorID);


export default router;
