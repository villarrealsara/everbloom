// Datos para conectarse a la base de datos everbloom.
// Los valores se leen del archivo .env para no escribir la clave en el codigo.

export const CONFIGURACION_BD = {
  host: process.env.BD_HOST || 'localhost',
  port: Number(process.env.BD_PUERTO) || 3306,
  user: process.env.BD_USUARIO || 'root',
  password: process.env.BD_CLAVE || '',
  database: process.env.BD_NOMBRE || 'everbloom',
};
