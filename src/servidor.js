// Crea la aplicacion web: configura las rutas, los archivos publicos y los errores.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { crearRutasProducto } from './rutas/producto-rutas.js';
import { crearRutasPedido } from './rutas/pedido-rutas.js';
import { crearRutasApi } from './rutas/api-rutas.js';
import { vistaResultado } from './vistas/resultado.js';

const CARPETA_PUBLICA = fileURLToPath(new URL('../publico/', import.meta.url));

/**
 * Devuelve la aplicacion lista para recibir peticiones.
 */
export function crearAplicacion() {
  const aplicacion = express();

  // Permite leer los datos de un formulario HTML (method="post") y los JSON que manda React.
  aplicacion.use(express.urlencoded({ extended: false }));
  aplicacion.use(express.json());

  // Permite que el front-end de React (otro puerto) llame a la API.
  const origenFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  aplicacion.use('/api', (peticion, respuesta, siguiente) => {
    respuesta.set('Access-Control-Allow-Origin', origenFrontend);
    respuesta.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    respuesta.set('Access-Control-Allow-Headers', 'Content-Type');
    if (peticion.method === 'OPTIONS') { respuesta.status(204).end(); return; }
    siguiente();
  });
  aplicacion.use(express.static(CARPETA_PUBLICA));

  aplicacion.get('/', (peticion, respuesta) => {
    respuesta.redirect('/productos');
  });
  aplicacion.use('/productos', crearRutasProducto());
  aplicacion.use('/pedidos', crearRutasPedido());
  aplicacion.use('/api', crearRutasApi());

  // Pagina para direcciones que no existen.
  aplicacion.use((peticion, respuesta) => {
    respuesta.status(404).send(vistaResultado({
      titulo: 'Página no encontrada',
      mensaje: 'La dirección que buscas no existe.',
      tipo: 'error',
    }));
  });

  // Pagina para errores inesperados (por ejemplo, si MySQL no responde).
  // eslint-disable-next-line no-unused-vars
  aplicacion.use((error, peticion, respuesta, siguiente) => {
    console.log(`Error: ${error.message}`);
    respuesta.status(500).send(vistaResultado({
      titulo: 'Ocurrió un error',
      mensaje: 'No se pudo completar la acción. Intenta de nuevo.',
      tipo: 'error',
    }));
  });

  return aplicacion;
}
