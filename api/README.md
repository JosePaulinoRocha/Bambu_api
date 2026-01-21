# Bambu API

API REST desarrollada en **Node.js + TypeScript + Express** para la gestión de tareas (TODO),
con autenticación mediante **JWT** y base de datos **MySQL**.

Este proyecto forma parte de una prueba técnica.

---

## 🚀 Tecnologías utilizadas

- Node.js
- TypeScript
- Express.js
- MySQL
- JWT (JSON Web Token)
- bcryptjs
- mysql2
- Postman

---

## 📁 Estructura del proyecto

api_bambu/
│
├── controllers/
├── routes/
├── middlewares/
├── BD/
│ └── Accesos_BD.ts
│
├── postman/
│ └── Bambu_Api.postman_collection.json
│
├── index.ts
├── package.json
├── tsconfig.json
└── README.md



---

## ⚙️ Base de datos

La conexión a la base de datos está definida directamente en el código:

```ts
host: 'localhost'
user: 'root'
password: ''
database: 'bambu_db'



---

## Autenticación

El API utiliza JWT para proteger los endpoints.

Flujo recomendado:
1. Crear usuario
2. Iniciar sesión (login)
3. Usar el token JWT para acceder a los endpoints protegidos

Header requerido:

