// Consultas de apoyo para el formulario de pedidos: clientes, productos disponibles y empaques.
import { obtenerConexion } from '../conexiones/conexion.js';

/**
 * Devuelve los usuarios activos que pueden hacer pedidos.
 */
export async function consultarClientes() {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    `SELECT id_usuario, CONCAT(nombres, ' ', apellidos) AS nombre, correo
     FROM usuarios WHERE estado = 1 ORDER BY nombres`,
  );
  return filas.map((fila) => ({ idUsuario: fila.id_usuario, nombre: fila.nombre, correo: fila.correo }));
}

/**
 * Devuelve los productos activos con la cantidad que hay en inventario.
 */
export async function consultarProductosConInventario() {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    `SELECT p.id_producto, p.nombre_producto, p.precio, IFNULL(i.cantidad, 0) AS disponibles
     FROM productos p
     LEFT JOIN inventario i ON i.id_producto = p.id_producto
     WHERE p.estado_producto = 1
     ORDER BY p.nombre_producto`,
  );
  return filas.map((fila) => ({
    idProducto: fila.id_producto,
    nombreProducto: fila.nombre_producto,
    precio: Number(fila.precio),
    disponibles: Number(fila.disponibles),
  }));
}

/**
 * Devuelve los empaques para regalo.
 */
export async function consultarEmpaques() {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    'SELECT id_empaque, nombre_empaque, precio_extra FROM empaques ORDER BY nombre_empaque',
  );
  return filas.map((fila) => ({
    idEmpaque: fila.id_empaque,
    nombreEmpaque: fila.nombre_empaque,
    precioExtra: Number(fila.precio_extra),
  }));
}
