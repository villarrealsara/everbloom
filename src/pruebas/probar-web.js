// Prueba del flujo web completo: llenar formulario -> enviar -> ver resultado.
// Levanta el servidor, hace las peticiones GET y POST como lo haria un navegador
// y comprueba la respuesta y los datos en la base de datos.
import { crearAplicacion } from '../servidor.js';
import { obtenerConexion, cerrarConexion } from '../conexiones/conexion.js';

let fallos = 0;

function comprobar(descripcion, condicion) {
  console.log(`${condicion ? 'OK   ' : 'FALLO'} - ${descripcion}`);
  if (!condicion) {
    fallos += 1;
  }
}

async function enviarFormulario(direccionBase, ruta, datos) {
  return fetch(`${direccionBase}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(datos).toString(),
  });
}

async function probar() {
  console.log('--- Prueba del modulo web de Productos ---');
  const servidor = crearAplicacion().listen(0);
  const direccionBase = `http://localhost:${servidor.address().port}`;
  const conexion = await obtenerConexion();
  const [categorias] = await conexion.execute('SELECT id_categoria FROM categorias LIMIT 1');
  const idCategoria = categorias[0].id_categoria;
  const nombreUnico = `Ramo web ${Date.now()}`;

  // GET: lista y formulario
  let respuesta = await fetch(`${direccionBase}/productos`);
  let pagina = await respuesta.text();
  comprobar('GET /productos responde 200 y muestra la lista', respuesta.status === 200 && pagina.includes("products-grid"));

  respuesta = await fetch(`${direccionBase}/productos/nuevo`);
  pagina = await respuesta.text();
  comprobar('GET /productos/nuevo muestra un formulario con method="post"',
    respuesta.status === 200 && pagina.includes('<form') && pagina.includes('method="post"'));
  comprobar('El formulario tiene la lista de categorias', pagina.includes('<option value="'));

  // POST: guardar
  respuesta = await enviarFormulario(direccionBase, '/productos', {
    nombreProducto: nombreUnico, idCategoria: String(idCategoria), precio: '52000', descripcion: 'Prueba web',
  });
  pagina = await respuesta.text();
  comprobar('POST /productos guarda y muestra la confirmacion', respuesta.status === 201 && pagina.includes('Producto guardado'));
  const [filas] = await conexion.execute(
    'SELECT id_producto, precio FROM productos WHERE nombre_producto = ?', [nombreUnico]);
  comprobar('El producto quedo guardado en la base de datos', filas.length === 1 && Number(filas[0].precio) === 52000);
  const idProducto = filas[0].id_producto;

  // POST con errores
  respuesta = await enviarFormulario(direccionBase, '/productos', {
    nombreProducto: '', idCategoria: String(idCategoria), precio: '1000', descripcion: '',
  });
  pagina = await respuesta.text();
  comprobar('POST sin nombre muestra el mensaje de error y no guarda',
    respuesta.status === 400 && pagina.includes('obligatorio'));
  respuesta = await enviarFormulario(direccionBase, '/productos', {
    nombreProducto: 'Sin precio', idCategoria: String(idCategoria), precio: '', descripcion: '',
  });
  pagina = await respuesta.text();
  comprobar('POST sin precio muestra el mensaje de error', respuesta.status === 400 && pagina.includes('precio'));

  // GET con parametro: buscar
  respuesta = await fetch(`${direccionBase}/productos?busqueda=${encodeURIComponent(nombreUnico)}`);
  pagina = await respuesta.text();
  comprobar('GET /productos?busqueda= encuentra el producto', pagina.includes(nombreUnico));
  respuesta = await fetch(`${direccionBase}/productos?busqueda=${encodeURIComponent('zzz-no-existe')}`);
  pagina = await respuesta.text();
  comprobar('GET con una busqueda sin resultados avisa que no hay productos',
    pagina.includes('No se encontraron productos'));

  // GET editar y POST actualizar
  respuesta = await fetch(`${direccionBase}/productos/${idProducto}/editar`);
  pagina = await respuesta.text();
  comprobar('GET /productos/:id/editar muestra el formulario con los datos',
    respuesta.status === 200 && pagina.includes(nombreUnico));
  respuesta = await enviarFormulario(direccionBase, `/productos/${idProducto}/actualizar`, {
    nombreProducto: `${nombreUnico} editado`, idCategoria: String(idCategoria), precio: '60000',
    descripcion: 'Editado', estadoProducto: 'on',
  });
  pagina = await respuesta.text();
  comprobar('POST actualizar muestra la confirmacion', respuesta.status === 200 && pagina.includes('Producto actualizado'));
  const [cambiado] = await conexion.execute(
    'SELECT nombre_producto, precio FROM productos WHERE id_producto = ?', [idProducto]);
  comprobar('El cambio se ve en la base de datos',
    cambiado[0].nombre_producto === `${nombreUnico} editado` && Number(cambiado[0].precio) === 60000);

  // Seguridad: el texto con etiquetas no se ejecuta
  respuesta = await enviarFormulario(direccionBase, `/productos/${idProducto}/actualizar`, {
    nombreProducto: '<script>alert(1)</script>', idCategoria: String(idCategoria), precio: '1000', estadoProducto: 'on',
  });
  respuesta = await fetch(`${direccionBase}/productos`);
  pagina = await respuesta.text();
  comprobar('Un nombre con etiquetas HTML se muestra como texto y no se ejecuta',
    !pagina.includes('<script>alert(1)</script>') && pagina.includes('&lt;script&gt;'));

  // POST eliminar
  respuesta = await enviarFormulario(direccionBase, `/productos/${idProducto}/eliminar`, {});
  pagina = await respuesta.text();
  comprobar('POST eliminar muestra la confirmacion', respuesta.status === 200 && pagina.includes('Producto eliminado'));
  const [borrado] = await conexion.execute('SELECT COUNT(*) AS total FROM productos WHERE id_producto = ?', [idProducto]);
  comprobar('El producto ya no esta en la base de datos', borrado[0].total === 0);
  respuesta = await enviarFormulario(direccionBase, `/productos/${idProducto}/eliminar`, {});
  comprobar('Eliminar un numero que no existe responde 404', respuesta.status === 404);

  // Direccion que no existe
  respuesta = await fetch(`${direccionBase}/no-existe`);
  comprobar('Una direccion que no existe responde 404', respuesta.status === 404);

  console.log(fallos === 0 ? '\nTodas las pruebas pasaron.' : `\nHubo ${fallos} fallo(s).`);
  servidor.close();
  await cerrarConexion();
  process.exitCode = fallos === 0 ? 0 : 1;
}

probar().catch(async (error) => {
  console.log(`Error en la prueba: ${error.message}`);
  await cerrarConexion();
  process.exit(1);
});
