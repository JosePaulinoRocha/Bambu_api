// controllers/Usuarios.controller.ts
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtSecret, jwtExpiresIn } from '../config/jwtConfig';
import prisma from "../prisma";


export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
  }

  try {
    // Obtener usuario por email usando Prisma
    const user = await prisma.users.findUnique({
      where: { Email: email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Comparar contraseña con hash
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const payload = { UserID: user.UserID };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // No enviar la contraseña al cliente
    const { Password, ...userWithoutPassword } = user;

    return res.json({ success: true, token, user: userWithoutPassword });

  } catch (error) {
    console.error('Error en Login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const ObtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();

    const usersSafe = users.map(({ Password, ...rest }) => rest);

    return res.json(usersSafe);
  } catch (error) {
    console.error("Error en ObtenerUsuarios:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

export const PostUsers = async (req: Request, res: Response) => {
  const { Name, Email, Password } = req.body;

  if (!Name || !Email || !Password) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    // Verificar si el email ya existe
    const existingUser = await prisma.users.findUnique({
      where: { Email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "El email ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Crear usuario
    await prisma.users.create({
      data: {
        Name,
        Email,
        Password: hashedPassword,
      },
    });

    return res.json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
};


export const UpdateUser = async (req: Request, res: Response) => {
  const { Name, Email } = req.body;
  const id = parseInt(req.params.id, 10);

  if (!Name || !Email) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    // Actualizar usuario
    await prisma.users.update({
      where: { UserID: id },
      data: {
        Name,
        Email,
      },
    });

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error en UpdateUser:", error);
    return res.status(500).json({ message: "Error updating user" });
  }
};