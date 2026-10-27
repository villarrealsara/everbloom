// Consulta de categorias (se usa para llenar la lista desplegable del formulario).
import { obtenerConexion } from '../conexiones/conexion.js';

/**
 * Devuelve todas las categorias ordenadas por nombre.
 */
export async function consultarCategorias() {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    'SELECT id_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria',
  );
  return filas.map((fila) => ({
    idCategoria: fila.id_categoria,
    nombreCategoria: fila.nombre_categoria,
  }));
}
