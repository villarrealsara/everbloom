// Prueba automatica del CRUD. Hace cada operacion y comprueba en la base de datos
// que el resultado es el esperado. Muestra OK o FALLO en cada paso.
import { obtenerConexion, cerrarConexion } from '../conexiones/conexion.js';
import {
  crearProducto,
  consultarProductos,
  consultarProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from '../servicios/producto-servicio.js';

let fallos = 0;

function comprobar(descripcion, condicion) {
  console.log(`${condicion ? 'OK   ' : 'FALLO'} - ${descripcion}`);
  if (!condicion) {
    fallos += 1;
  }
}

async function contarFilas(idProducto) {
  const conexion = await obtenerConexion();
  const [filas] = await conexion.execute(
    'SELECT COUNT(*) AS total FROM productos WHERE id_producto = ?',
    [idProducto],
  );
  return filas[0].total;
}

async function probar() {
  console.log('--- Prueba del CRUD de Productos ---');
  const conexion = await obtenerConexion();
  const [categorias] = await conexion.execute('SELECT id_categoria FROM categorias LIMIT 1');
  comprobar('Conexion a la base de datos everbloom y existe al menos una categoria',
    categorias.length > 0);
  const idCategoria = categorias[0].id_categoria;

  // CREAR
  const creado = await crearProducto({
    idCategoria,
    nombreProducto: 'Ramo de prueba',
    descripcion: 'Producto creado por la prueba',
    precio: 45000,
  });
  comprobar('CREAR: el producto recibe un numero (id)', creado.idProducto > 0);
  comprobar('CREAR: el producto quedo guardado en la base de datos',
    await contarFilas(creado.idProducto) === 1);

  // LEER
  const lista = await consultarProductos();
  comprobar('LEER: el producto aparece en la lista',
    lista.some((p) => p.idProducto === creado.idProducto));
  const buscado = await consultarProductoPorId(creado.idProducto);
  comprobar('LEER: se encuentra por su numero con el nombre correcto',
    buscado !== null && buscado.nombreProducto === 'Ramo de prueba');

  // ACTUALIZAR
  const actualizado = await actualizarProducto(creado.idProducto, {
    nombreProducto: 'Ramo de prueba editado',
    precio: 50000,
  });
  comprobar('ACTUALIZAR: el nombre y el precio cambiaron',
    actualizado.nombreProducto === 'Ramo de prueba editado' && actualizado.precio === 50000);
  const [filaActual] = await conexion.execute(
    'SELECT precio FROM productos WHERE id_producto = ?', [creado.idProducto]);
  comprobar('ACTUALIZAR: el cambio se ve en la base de datos',
    Number(filaActual[0].precio) === 50000);

  // VALIDACIONES
  let huboError = false;
  try {
    await crearProducto({ idCategoria, nombreProducto: '', precio: 1000 });
  } catch (error) {
    huboError = true;
  }
  comprobar('VALIDAR: no deja crear un producto sin nombre', huboError);
  huboError = false;
  try {
    await crearProducto({ idCategoria: 99999, nombreProducto: 'X', precio: 1000 });
  } catch (error) {
    huboError = true;
  }
  comprobar('VALIDAR: no deja crear un producto con categoria que no existe', huboError);

  // ELIMINAR
  const seElimino = await eliminarProducto(creado.idProducto);
  comprobar('ELIMINAR: el sistema confirma que lo elimino', seElimino === true);
  comprobar('ELIMINAR: ya no esta en la base de datos',
    await contarFilas(creado.idProducto) === 0);
  comprobar('ELIMINAR: borrar un numero que no existe devuelve false',
    await eliminarProducto(creado.idProducto) === false);

  console.log(fallos === 0 ? '\nTodas las pruebas pasaron.' : `\nHubo ${fallos} fallo(s).`);
  await cerrarConexion();
  process.exitCode = fallos === 0 ? 0 : 1;
}

probar().catch(async (error) => {
  console.log(`Error en la prueba: ${error.message}`);
  await cerrarConexion();
  process.exitCode = 1;
});
