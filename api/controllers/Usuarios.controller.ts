// controllers/Usuarios.controller.ts
import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtSecret, jwtExpiresIn } from '../config/jwtConfig';


export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
  }

  let con;
  try {
    con = await connect();

    // Obtener usuario por email
    const query = 'SELECT * FROM users WHERE Email = ?';
    const [users] = await con.query(query, [email]) as any[];

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = users[0];

    // Comparar contraseña con hash
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const payload = { UserID: user.UserID };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // No enviar la contraseña al cliente
    delete user.Password;

    return res.json({ success: true, token, user });

  } catch (error) {
    console.error('Error en Login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  } finally {
    await con?.end();
  }
};


export const ObtenerUsuarios = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM users';
        const Users = (await con.query(query))[0] as any[];
        result = Users;
    } catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const PostUsers = async (req: Request, res: Response) => {
  const { Name, Email, Password } = req.body;
  let con;

  if (!Name || !Email || !Password) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    con = await connect();

    const [exists] = await con.query(
      'SELECT COUNT(*) as count FROM users WHERE Email = ?',
      [Email]
    ) as any[];

    if (exists[0].count > 0) {
      return res.status(400).json({ message: 'El email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    await con.query(
      'INSERT INTO users (Name, Email, Password) VALUES (?, ?, ?)',
      [Name, Email, hashedPassword]
    );

    return res.json({ message: 'Usuario creado correctamente' });

  } catch (error) {
    console.log('Error creando usuario:', error);
    return res.status(500).json({ message: 'Error al crear usuario' });
  } finally {
    await con?.end();
  }
};


export const UpdateUser = async (req: Request, res: Response) => {
    let con;
    try {
        con = await connect();
        const { Name, Email } = req.body;
        const id = req.params.id;

        let query = 'UPDATE users SET Name = ?, Email = ? WHERE UserID = ?';
        const values = [Name, Email, id];
        await con.query(query, values);

        return res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error en Usuarios', error);
        return res.status(500).json({ message: 'Error updating user' });
    } finally {
        await con?.end();
    }
};
