// CRUD del modulo Productos: Crear, Leer (consultar), Actualizar y Eliminar.
import { obtenerConexion } from '../conexiones/conexion.js';
import { Producto } from '../modelos/producto.js';

const CONSULTA_BASE = `
  SELECT p.id_producto, p.id_categoria, p.nombre_producto, p.descripcion,
         p.precio, p.imagen, p.estado_producto, c.nombre_categoria
  FROM productos p
  INNER JOIN categorias c ON c.id_categoria = p.id_categoria`;

/**
 * Traduce los errores de MySQL a mensajes faciles de entender.
 */
function traducirError(error) {
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new Error('La categoría indicada no existe.');
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new Error('No se puede eliminar: el producto ya está en algún pedido.');
  }
  if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return new Error('El precio no puede ser negativo.');
  }
  return error;
}

/**
 * CREAR: inserta un producto nuevo y devuelve el producto con su id.
 */
export async function crearProducto(datos) {
  const producto = new Producto(datos);
  const errores = producto.validar();
  if (errores.length > 0) {
    throw new Error(errores.join(' '));
  }
  const conexion = await obtenerConexion();
  try {
    const [resultado] = await conexion.execute(
      `INSERT INTO productos
         (id_categoria, nombre_producto, descripcion, precio, imagen, estado_producto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        producto.idCategoria,
        producto.nombreProducto.trim(),
        producto.descripcion,
        producto.precio,
        producto.imagen,
        producto.estadoProducto,
      ],
    );
    return consultarProductoPorId(resultado.insertId);
  } catch (error) {
    throw traducirError(error);
  }
}

/**
 * LEER: devuelve la lista de todos los productos.
 */
export async function consultarProductos() {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(`${CONSULTA_BASE} ORDER BY p.id_producto`);
  return filas.map((fila) => Producto.desdeFila(fila));
}

/**
 * LEER: devuelve un producto por su id (o null si no existe).
 */
export async function consultarProductoPorId(idProducto) {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    `${CONSULTA_BASE} WHERE p.id_producto = ?`,
    [idProducto],
  );
  return filas.length === 0 ? null : Producto.desdeFila(filas[0]);
}

/**
 * LEER: busca productos cuyo nombre contenga el texto indicado.
 */
export async function buscarProductosPorNombre(texto) {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    `${CONSULTA_BASE} WHERE p.nombre_producto LIKE ? ORDER BY p.id_producto`,
    [`%${texto}%`],
  );
  return filas.map((fila) => Producto.desdeFila(fila));
}

/**
 * ACTUALIZAR: cambia los datos de un producto que ya existe.
 * Devuelve el producto actualizado, o null si el id no existe.
 */
export async function actualizarProducto(idProducto, datos) {
  const actual = await consultarProductoPorId(idProducto);
  if (actual === null) {
    return null;
  }
  const producto = new Producto({ ...actual, ...datos, idProducto });
  const errores = producto.validar();
  if (errores.length > 0) {
    throw new Error(errores.join(' '));
  }
  const conexion = await obtenerConexion();
  try {
    await conexion.execute(
      `UPDATE productos
       SET id_categoria = ?, nombre_producto = ?, descripcion = ?,
           precio = ?, imagen = ?, estado_producto = ?
       WHERE id_producto = ?`,
      [
        producto.idCategoria,
        producto.nombreProducto.trim(),
        producto.descripcion,
        producto.precio,
        producto.imagen,
        producto.estadoProducto,
        idProducto,
      ],
    );
    return consultarProductoPorId(idProducto);
  } catch (error) {
    throw traducirError(error);
  }
}

/**
 * ELIMINAR: borra un producto. Devuelve true si lo borro, false si no existia.
 */
export async function eliminarProducto(idProducto) {
  const conexion = await obtenerConexion();
  try {
    const [resultado] = await conexion.execute(
      'DELETE FROM productos WHERE id_producto = ?',
      [idProducto],
    );
    return resultado.affectedRows > 0;
  } catch (error) {
    throw traducirError(error);
  }
}
