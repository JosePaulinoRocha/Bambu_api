import mysql from 'mysql2/promise';

export async function connect() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bambu_db',
        timezone: 'local',
    });
}