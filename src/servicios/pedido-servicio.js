// Logica del modulo Pedidos: crear un pedido, consultarlo y cambiar su estado.
// Crear un pedido toca tres tablas (pedidos, detalle_pedido e inventario), por eso se hace
// dentro de una TRANSACCION: o se guarda todo, o no se guarda nada.
import { obtenerConexion } from '../conexiones/conexion.js';
import { Pedido, ESTADOS_PEDIDO } from '../modelos/pedido.js';

const CONSULTA_PEDIDOS = `
  SELECT p.id_pedido, p.id_usuario, CONCAT(u.nombres, ' ', u.apellidos) AS cliente,
         p.fecha_pedido, p.estado_pedido,
         IFNULL(SUM(d.cantidad * d.precio_unitario + d.cantidad * IFNULL(e.precio_extra, 0)), 0) AS total
  FROM pedidos p
  INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
  LEFT JOIN detalle_pedido d ON d.id_pedido = p.id_pedido
  LEFT JOIN empaques e ON e.id_empaque = d.id_empaque`;

/**
 * Error propio para los problemas que la persona puede corregir (datos mal escritos, falta de inventario).
 */
export class ErrorDePedido extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}

/**
 * CREAR: guarda el pedido, sus productos y descuenta el inventario.
 * Devuelve el pedido completo.
 */
export async function crearPedido(datos) {
  const pedido = new Pedido(datos);
  const errores = pedido.validar();
  if (errores.length > 0) {
    throw new ErrorDePedido(errores.join(' '));
  }
  const conexion = await obtenerConexion();
  await conexion.beginTransaction();
  try {
    const [usuarios] = await conexion.execute('SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND estado = 1', [pedido.idUsuario]);
    if (usuarios.length === 0) {
      throw new ErrorDePedido('El cliente indicado no existe o está inactivo.', 404);
    }
    const [resultado] = await conexion.execute('INSERT INTO pedidos (id_usuario) VALUES (?)', [pedido.idUsuario]);
    const idPedido = resultado.insertId;

    for (const item of pedido.items) {
      // FOR UPDATE bloquea la fila para que dos pedidos al tiempo no descuenten el mismo inventario.
      const [productos] = await conexion.execute(
        `SELECT p.nombre_producto, p.precio, p.estado_producto, IFNULL(i.cantidad, 0) AS disponibles
         FROM productos p LEFT JOIN inventario i ON i.id_producto = p.id_producto
         WHERE p.id_producto = ? FOR UPDATE`,
        [item.idProducto],
      );
      if (productos.length === 0 || !productos[0].estado_producto) {
        throw new ErrorDePedido('El producto elegido no existe o no está disponible.', 404);
      }
      const producto = productos[0];
      if (Number(item.cantidad) > Number(producto.disponibles)) {
        throw new ErrorDePedido(
          `No hay suficiente inventario de "${producto.nombre_producto}" (disponibles: ${producto.disponibles}).`,
          409,
        );
      }
      await conexion.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, id_empaque, cantidad, precio_unitario, color, mensaje_tarjeta)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idPedido,
          item.idProducto,
          item.idEmpaque || null,
          item.cantidad,
          producto.precio,
          item.color || null,
          item.mensajeTarjeta || null,
        ],
      );
      await conexion.execute(
        'UPDATE inventario SET cantidad = cantidad - ?, fecha_actualizacion = NOW() WHERE id_producto = ?',
        [item.cantidad, item.idProducto],
      );
    }
    await conexion.commit();
    return consultarPedidoPorId(idPedido);
  } catch (error) {
    await conexion.rollback();
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new ErrorDePedido('El empaque elegido no existe.');
    }
    throw error;
  }
}

/**
 * LEER: devuelve los pedidos, del mas nuevo al mas viejo. Se puede filtrar por estado.
 */
export async function consultarPedidos(estado = '') {
  const conexion = await obtenerConexion();
  if (estado !== '' && !ESTADOS_PEDIDO.includes(estado)) {
    throw new ErrorDePedido('El estado indicado no es válido.');
  }
  const filtro = estado === '' ? '' : ' WHERE p.estado_pedido = ?';
  const [filas] = await conexion.execute(
    `${CONSULTA_PEDIDOS}${filtro} GROUP BY p.id_pedido ORDER BY p.id_pedido DESC`,
    estado === '' ? [] : [estado],
  );
  return filas.map(Pedido.desdeFila);
}

/**
 * LEER UNO: devuelve el pedido con sus productos, o null si no existe.
 */
export async function consultarPedidoPorId(idPedido) {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(`${CONSULTA_PEDIDOS} WHERE p.id_pedido = ? GROUP BY p.id_pedido`, [idPedido]);
  if (filas.length === 0) {
    return null;
  }
  const pedido = Pedido.desdeFila(filas[0]);
  const [detalle] = await conexion.execute(
    `SELECT d.id_producto, pr.nombre_producto, d.cantidad, d.precio_unitario, d.color, d.mensaje_tarjeta,
            e.nombre_empaque, IFNULL(e.precio_extra, 0) AS precio_extra
     FROM detalle_pedido d
     INNER JOIN productos pr ON pr.id_producto = d.id_producto
     LEFT JOIN empaques e ON e.id_empaque = d.id_empaque
     WHERE d.id_pedido = ? ORDER BY d.id_detalle`,
    [idPedido],
  );
  pedido.items = detalle.map((fila) => ({
    idProducto: fila.id_producto,
    nombreProducto: fila.nombre_producto,
    cantidad: fila.cantidad,
    precioUnitario: Number(fila.precio_unitario),
    color: fila.color,
    mensajeTarjeta: fila.mensaje_tarjeta,
    nombreEmpaque: fila.nombre_empaque,
    precioExtra: Number(fila.precio_extra),
  }));
  return pedido;
}

/**
 * ACTUALIZAR: cambia el estado del pedido. Devuelve el pedido, o null si no existe.
 */
export async function cambiarEstadoPedido(idPedido, estadoPedido) {
  if (!ESTADOS_PEDIDO.includes(estadoPedido)) {
    throw new ErrorDePedido(`El estado debe ser uno de: ${ESTADOS_PEDIDO.join(', ')}.`);
  }
  const conexion = await obtenerConexion();
  const [resultado] = await conexion.execute('UPDATE pedidos SET estado_pedido = ? WHERE id_pedido = ?', [estadoPedido, idPedido]);
  if (resultado.affectedRows === 0) {
    return null;
  }
  return consultarPedidoPorId(idPedido);
}
