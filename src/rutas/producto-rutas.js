// Rutas del modulo Productos. Cada ruta recibe una peticion GET o POST del navegador.
// Es el equivalente a un Servlet con doGet (consultas) y doPost (datos del formulario).
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
import { vistaListaProductos } from '../vistas/lista-productos.js';
import { vistaFormularioProducto } from '../vistas/formulario-producto.js';
import { vistaResultado } from '../vistas/resultado.js';

/**
 * Convierte los datos que llegan del formulario (texto) en un objeto con los tipos correctos.
 * Es el equivalente a request.getParameter() en un Servlet.
 */
function leerDatosFormulario(cuerpo, incluirEstado) {
  const datos = {
    nombreProducto: (cuerpo.nombreProducto || '').trim(),
    idCategoria: cuerpo.idCategoria === '' ? null : Number(cuerpo.idCategoria),
    precio: cuerpo.precio === '' || cuerpo.precio === undefined ? NaN : Number(cuerpo.precio),
    descripcion: cuerpo.descripcion ? cuerpo.descripcion.trim() : null,
  };
  if (incluirEstado) {
    datos.estadoProducto = cuerpo.estadoProducto === 'on';
  }
  return datos;
}

/**
 * GET /productos - muestra la lista, o el resultado de la busqueda si viene ?busqueda=
 */
async function mostrarListaProductos(peticion, respuesta) {
  const busqueda = String(peticion.query.busqueda || '').trim();
  const productos = busqueda === ''
    ? await consultarProductos()
    : await buscarProductosPorNombre(busqueda);
  respuesta.send(vistaListaProductos({ productos, busqueda }));
}

/**
 * GET /productos/nuevo - muestra el formulario vacio.
 */
async function mostrarFormularioNuevo(peticion, respuesta) {
  const categorias = await consultarCategorias();
  const producto = new Producto({ idCategoria: null, nombreProducto: '', precio: '' });
  respuesta.send(vistaFormularioProducto({
    titulo: 'Nuevo producto',
    accion: '/productos',
    producto,
    categorias,
  }));
}

/**
 * POST /productos - recibe el formulario y guarda el producto nuevo.
 */
async function guardarProductoNuevo(peticion, respuesta) {
  const datos = leerDatosFormulario(peticion.body, false);
  const producto = new Producto(datos);
  const errores = producto.validar();
  if (errores.length === 0) {
    try {
      const guardado = await crearProducto(datos);
      respuesta.status(201).send(vistaResultado({
        titulo: 'Producto guardado',
        mensaje: 'El producto se guardó correctamente.',
        producto: guardado,
      }));
      return;
    } catch (error) {
      errores.push(error.message);
    }
  }
  const categorias = await consultarCategorias();
  respuesta.status(400).send(vistaFormularioProducto({
    titulo: 'Nuevo producto',
    accion: '/productos',
    producto,
    categorias,
    errores,
  }));
}

/**
 * GET /productos/:id/editar - muestra el formulario con los datos del producto.
 */
async function mostrarFormularioEdicion(peticion, respuesta) {
  const producto = await consultarProductoPorId(Number(peticion.params.id));
  if (producto === null) {
    respuesta.status(404).send(vistaResultado({
      titulo: 'Producto no encontrado',
      mensaje: 'No existe un producto con ese número.',
      tipo: 'error',
    }));
    return;
  }
  const categorias = await consultarCategorias();
  respuesta.send(vistaFormularioProducto({
    titulo: 'Editar producto',
    accion: `/productos/${producto.idProducto}/actualizar`,
    producto,
    categorias,
    mostrarEstado: true,
  }));
}

/**
 * POST /productos/:id/actualizar - recibe el formulario y guarda los cambios.
 */
async function guardarCambiosProducto(peticion, respuesta) {
  const idProducto = Number(peticion.params.id);
  const datos = leerDatosFormulario(peticion.body, true);
  const producto = new Producto({ ...datos, idProducto });
  const errores = producto.validar();
  if (errores.length === 0) {
    try {
      const actualizado = await actualizarProducto(idProducto, datos);
      if (actualizado === null) {
        respuesta.status(404).send(vistaResultado({
          titulo: 'Producto no encontrado',
          mensaje: 'No existe un producto con ese número.',
          tipo: 'error',
        }));
        return;
      }
      respuesta.send(vistaResultado({
        titulo: 'Producto actualizado',
        mensaje: 'Los cambios se guardaron correctamente.',
        producto: actualizado,
      }));
      return;
    } catch (error) {
      errores.push(error.message);
    }
  }
  const categorias = await consultarCategorias();
  respuesta.status(400).send(vistaFormularioProducto({
    titulo: 'Editar producto',
    accion: `/productos/${idProducto}/actualizar`,
    producto,
    categorias,
    errores,
    mostrarEstado: true,
  }));
}

/**
 * POST /productos/:id/eliminar - elimina el producto.
 */
async function eliminarProductoDesdeFormulario(peticion, respuesta) {
  try {
    const seElimino = await eliminarProducto(Number(peticion.params.id));
    if (!seElimino) {
      respuesta.status(404).send(vistaResultado({
        titulo: 'Producto no encontrado',
        mensaje: 'No existe un producto con ese número.',
        tipo: 'error',
      }));
      return;
    }
    respuesta.send(vistaResultado({
      titulo: 'Producto eliminado',
      mensaje: 'El producto se eliminó correctamente.',
    }));
  } catch (error) {
    respuesta.status(409).send(vistaResultado({
      titulo: 'No se pudo eliminar',
      mensaje: error.message,
      tipo: 'error',
    }));
  }
}

/**
 * Envuelve una funcion de ruta para que, si falla, el error llegue al manejador de errores.
 */
function protegerRuta(funcionRuta) {
  return (peticion, respuesta, siguiente) => {
    funcionRuta(peticion, respuesta).catch(siguiente);
  };
}

/**
 * Crea el grupo de rutas de productos.
 */
export function crearRutasProducto() {
  const rutas = Router();
  rutas.get('/', protegerRuta(mostrarListaProductos));
  rutas.get('/nuevo', protegerRuta(mostrarFormularioNuevo));
  rutas.post('/', protegerRuta(guardarProductoNuevo));
  rutas.get('/:id/editar', protegerRuta(mostrarFormularioEdicion));
  rutas.post('/:id/actualizar', protegerRuta(guardarCambiosProducto));
  rutas.post('/:id/eliminar', protegerRuta(eliminarProductoDesdeFormulario));
  return rutas;
}
