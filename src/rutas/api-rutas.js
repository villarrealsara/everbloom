// Rutas de la API (responden JSON). Las usa el front-end hecho en React.
// GET /api/productos, GET /api/productos/:id, POST, PUT y DELETE: es el CRUD completo.
import { Router } from 'express';
import { Producto } from '../modelos/producto.js';
import {
  crearProducto,
  consultarProductos,
  consultarProductoPorId,
  buscarProductosPorNombre,
  actualizarProducto,
  eliminarProducto,
} from '../servicios/producto-servicio.js';
import { consultarCategorias } from '../servicios/categoria-servicio.js';

/**
 * Convierte el JSON que llega del front-end en un objeto con los tipos correctos.
 */
function leerDatosJson(cuerpo) {
  const datos = {
    nombreProducto: String(cuerpo.nombreProducto ?? '').trim(),
    idCategoria: cuerpo.idCategoria === '' || cuerpo.idCategoria == null ? null : Number(cuerpo.idCategoria),
    precio: cuerpo.precio === '' || cuerpo.precio == null ? NaN : Number(cuerpo.precio),
    descripcion: cuerpo.descripcion ? String(cuerpo.descripcion).trim() : null,
  };
  if (cuerpo.estadoProducto !== undefined) {
    datos.estadoProducto = Boolean(cuerpo.estadoProducto);
  }
  return datos;
}

/** Envuelve una ruta para que los errores lleguen al manejador de errores. */
function protegerRuta(funcionRuta) {
  return (peticion, respuesta, siguiente) => {
    funcionRuta(peticion, respuesta).catch(siguiente);
  };
}

function noEncontrado(respuesta) {
  respuesta.status(404).json({ error: 'No existe un producto con ese número.' });
}

export function crearRutasApi() {
  const rutas = Router();

  rutas.get('/categorias', protegerRuta(async (peticion, respuesta) => {
    respuesta.json(await consultarCategorias());
  }));

  rutas.get('/productos', protegerRuta(async (peticion, respuesta) => {
    const busqueda = String(peticion.query.busqueda || '').trim();
    respuesta.json(busqueda === ''
      ? await consultarProductos()
      : await buscarProductosPorNombre(busqueda));
  }));

  rutas.get('/productos/:id', protegerRuta(async (peticion, respuesta) => {
    const producto = await consultarProductoPorId(Number(peticion.params.id));
    if (producto === null) { noEncontrado(respuesta); return; }
    respuesta.json(producto);
  }));

  rutas.post('/productos', protegerRuta(async (peticion, respuesta) => {
    const datos = leerDatosJson(peticion.body);
    const errores = new Producto(datos).validar();
    if (errores.length > 0) {
      respuesta.status(400).json({ error: errores.join(' '), errores });
      return;
    }
    respuesta.status(201).json(await crearProducto(datos));
  }));

  rutas.put('/productos/:id', protegerRuta(async (peticion, respuesta) => {
    const idProducto = Number(peticion.params.id);
    const datos = leerDatosJson(peticion.body);
    const errores = new Producto({ ...datos, idProducto }).validar();
    if (errores.length > 0) {
      respuesta.status(400).json({ error: errores.join(' '), errores });
      return;
    }
    const actualizado = await actualizarProducto(idProducto, datos);
    if (actualizado === null) { noEncontrado(respuesta); return; }
    respuesta.json(actualizado);
  }));

  rutas.delete('/productos/:id', protegerRuta(async (peticion, respuesta) => {
    const seElimino = await eliminarProducto(Number(peticion.params.id));
    if (!seElimino) { noEncontrado(respuesta); return; }
    respuesta.status(204).end();
  }));

  // Errores de la API: siempre se responde con JSON.
  // eslint-disable-next-line no-unused-vars
  rutas.use((error, peticion, respuesta, siguiente) => {
    console.log(`Error en la API: ${error.message}`);
    const conflicto = error.message.startsWith('No se puede eliminar');
    respuesta.status(conflicto ? 409 : 500).json({
      error: conflicto || error.message.includes('categoría') || error.message.includes('precio')
        ? error.message
        : 'No se pudo completar la acción. Intenta de nuevo.',
    });
  });
  return rutas;
}
