// Rutas del modulo Pedidos (capa Controlador del patron MVC).
// Reciben la peticion, llaman al servicio (Modelo/logica) y responden con una vista.
import { Router } from 'express';
import {
  crearPedido,
  consultarPedidos,
  consultarPedidoPorId,
  cambiarEstadoPedido,
  ErrorDePedido,
} from '../servicios/pedido-servicio.js';
import { consultarClientes, consultarProductosConInventario, consultarEmpaques } from '../servicios/catalogo-servicio.js';
import { vistaListaPedidos } from '../vistas/lista-pedidos.js';
import { vistaFormularioPedido } from '../vistas/formulario-pedido.js';
import { vistaPedidoConfirmado } from '../vistas/pedido-confirmado.js';

/**
 * Convierte lo que llega del formulario (todo texto) en datos con el tipo correcto.
 */
function leerDatosPedido(cuerpo) {
  const numero = (valor) => (valor === undefined || valor === '' ? null : Number(valor));
  return {
    idUsuario: numero(cuerpo.idUsuario),
    items: [{
      idProducto: numero(cuerpo.idProducto),
      cantidad: numero(cuerpo.cantidad),
      idEmpaque: numero(cuerpo.idEmpaque),
      color: (cuerpo.color || '').trim() || null,
      mensajeTarjeta: (cuerpo.mensajeTarjeta || '').trim() || null,
    }],
  };
}

function mostrarNoEncontrado(respuesta) {
  respuesta.status(404).send(vistaPedidoConfirmado({
    titulo: 'Pedido no encontrado',
    mensaje: 'No existe un pedido con ese número.',
    tipo: 'error',
  }));
}

/** GET /pedidos - lista de pedidos (se puede filtrar con ?estado=Pendiente). */
async function mostrarListaPedidos(peticion, respuesta) {
  const estado = String(peticion.query.estado || '').trim();
  try {
    respuesta.send(vistaListaPedidos({ pedidos: await consultarPedidos(estado), estado }));
  } catch (error) {
    if (error instanceof ErrorDePedido) {
      respuesta.status(error.estado).send(vistaPedidoConfirmado({ titulo: 'Filtro no válido', mensaje: error.message, tipo: 'error' }));
      return;
    }
    throw error;
  }
}

/** GET /pedidos/nuevo - formulario vacio. */
async function mostrarFormularioNuevo(peticion, respuesta) {
  respuesta.send(vistaFormularioPedido({
    clientes: await consultarClientes(),
    productos: await consultarProductosConInventario(),
    empaques: await consultarEmpaques(),
  }));
}

/** POST /pedidos - recibe el formulario y guarda el pedido. */
async function guardarPedidoNuevo(peticion, respuesta) {
  const datos = leerDatosPedido(peticion.body);
  try {
    const pedido = await crearPedido(datos);
    respuesta.status(201).send(vistaPedidoConfirmado({
      titulo: 'Pedido confirmado',
      mensaje: 'Tu pedido se registró correctamente y el inventario se actualizó.',
      pedido,
    }));
  } catch (error) {
    if (!(error instanceof ErrorDePedido)) {
      throw error;
    }
    // Si el error lo puede corregir la persona, se vuelve a mostrar el formulario con lo que escribio.
    respuesta.status(error.estado).send(vistaFormularioPedido({
      clientes: await consultarClientes(),
      productos: await consultarProductosConInventario(),
      empaques: await consultarEmpaques(),
      datos: { ...peticion.body },
      errores: [error.message],
    }));
  }
}

/** GET /pedidos/:id - detalle de un pedido. */
async function mostrarDetallePedido(peticion, respuesta) {
  const pedido = await consultarPedidoPorId(Number(peticion.params.id));
  if (pedido === null) {
    mostrarNoEncontrado(respuesta);
    return;
  }
  respuesta.send(vistaPedidoConfirmado({ titulo: `Pedido N.° ${pedido.idPedido}`, mensaje: 'Estos son los datos del pedido.', pedido }));
}

/** POST /pedidos/:id/estado - cambia el estado del pedido. */
async function guardarEstado(peticion, respuesta) {
  try {
    const pedido = await cambiarEstadoPedido(Number(peticion.params.id), String(peticion.body.estadoPedido || ''));
    if (pedido === null) {
      mostrarNoEncontrado(respuesta);
      return;
    }
    respuesta.send(vistaPedidoConfirmado({ titulo: 'Estado actualizado', mensaje: `El pedido quedó en estado ${pedido.estadoPedido}.`, pedido }));
  } catch (error) {
    if (error instanceof ErrorDePedido) {
      respuesta.status(error.estado).send(vistaPedidoConfirmado({ titulo: 'No se pudo cambiar el estado', mensaje: error.message, tipo: 'error' }));
      return;
    }
    throw error;
  }
}

/** Si una ruta falla, el error pasa al manejador general de errores del servidor. */
function protegerRuta(funcionRuta) {
  return (peticion, respuesta, siguiente) => {
    funcionRuta(peticion, respuesta).catch(siguiente);
  };
}

export function crearRutasPedido() {
  const rutas = Router();
  rutas.get('/', protegerRuta(mostrarListaPedidos));
  rutas.get('/nuevo', protegerRuta(mostrarFormularioNuevo));
  rutas.post('/', protegerRuta(guardarPedidoNuevo));
  rutas.get('/:id', protegerRuta(mostrarDetallePedido));
  rutas.post('/:id/estado', protegerRuta(guardarEstado));
  return rutas;
}
