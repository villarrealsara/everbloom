// Conexion a MySQL (en JavaScript hace el mismo trabajo que JDBC en Java).
import mysql from 'mysql2/promise';
import { CONFIGURACION_BD } from '../configuraciones/base-datos.js';

let conexionActual = null;

/**
 * Abre la conexion con la base de datos la primera vez
 * y despues devuelve la misma conexion.
 */
export async function obtenerConexion() {
  if (conexionActual === null) {
    conexionActual = await mysql.createConnection(CONFIGURACION_BD);
  }
  return conexionActual;
}

/**
 * Cierra la conexion cuando el programa termina.
 */
export async function cerrarConexion() {
  if (conexionActual !== null) {
    await conexionActual.end();
    conexionActual = null;
  }
}
