// Prueba del modulo Pedidos: llena el formulario, lo envia y revisa la respuesta y la base de datos.
// La prueba crea sus propios datos (cliente y producto) y los borra al terminar.
import { crearAplicacion } from '../servidor.js';
import { obtenerConexion, cerrarConexion } from '../conexiones/conexion.js';

let fallos = 0;

function comprobar(descripcion, condicion) {
  console.log(`${condicion ? 'OK   ' : 'FALLO'} - ${descripcion}`);
  if (!condicion) {
    fallos += 1;
  }
}

async function enviar(direccionBase, ruta, datos) {
  return fetch(`${direccionBase}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(datos).toString(),
  });
}

async function probar() {
  console.log('--- Prueba del modulo web de Pedidos ---');
  const conexion = await obtenerConexion();
  const sello = Date.now();

  // Datos de prueba propios
  await conexion.execute("INSERT IGNORE INTO roles (nombre_rol, descripcion) VALUES ('Cliente', 'Compra arreglos florales')");
  const [roles] = await conexion.execute("SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente'");
  const [usuario] = await conexion.execute(
    "INSERT INTO usuarios (id_rol, nombres, apellidos, correo, contrasena) VALUES (?, 'Prueba', 'Pedidos', ?, 'sin-contrasena')",
    [roles[0].id_rol, `prueba.${sello}@ejemplo.com`],
  );
  const idUsuario = usuario.insertId;
  await conexion.execute("INSERT IGNORE INTO categorias (nombre_categoria) VALUES ('Categoria de prueba')");
  const [categorias] = await conexion.execute("SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Categoria de prueba'");
  const [producto] = await conexion.execute(
    'INSERT INTO productos (id_categoria, nombre_producto, precio) VALUES (?, ?, 50000)',
    [categorias[0].id_categoria, `Ramo pedido ${sello}`],
  );
  const idProducto = producto.insertId;
  await conexion.execute('INSERT INTO inventario (id_producto, cantidad) VALUES (?, 10)', [idProducto]);
  await conexion.execute("INSERT IGNORE INTO empaques (nombre_empaque, precio_extra) VALUES ('Caja de prueba', 8000)");
  const [empaques] = await conexion.execute("SELECT id_empaque FROM empaques WHERE nombre_empaque = 'Caja de prueba'");
  const idEmpaque = empaques[0].id_empaque;

  const servidor = crearAplicacion().listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const inventario = async () => {
    const [f] = await conexion.execute('SELECT cantidad FROM inventario WHERE id_producto = ?', [idProducto]);
    return f[0].cantidad;
  };
  const datosBuenos = {
    idUsuario: String(idUsuario), idProducto: String(idProducto), cantidad: '2',
    idEmpaque: String(idEmpaque), color: 'rojo', mensajeTarjeta: 'Feliz cumpleaños',
  };
  let idPedido = null;

  try {
    // GET: lista y formulario
    let respuesta = await fetch(`${base}/pedidos`);
    let pagina = await respuesta.text();
    comprobar('GET /pedidos responde 200 y muestra la lista', respuesta.status === 200 && pagina.includes('products-grid'));
    respuesta = await fetch(`${base}/pedidos/nuevo`);
    pagina = await respuesta.text();
    comprobar('GET /pedidos/nuevo muestra un formulario con method="post"', respuesta.status === 200 && pagina.includes('method="post"'));
    comprobar('El formulario tiene clientes, productos y empaques', pagina.includes('name="idUsuario"') && pagina.includes(`Ramo pedido ${sello}`) && pagina.includes('Caja de prueba'));

    // POST: pedido correcto
    respuesta = await enviar(base, '/pedidos', datosBuenos);
    pagina = await respuesta.text();
    comprobar('POST /pedidos guarda y muestra "Pedido confirmado"', respuesta.status === 201 && pagina.includes('Pedido confirmado'));
    comprobar('El total es 2 x 50.000 + 2 x 8.000 de empaque = $ 116.000', pagina.includes('116.000'));
    const [pedidos] = await conexion.execute('SELECT id_pedido, estado_pedido FROM pedidos WHERE id_usuario = ?', [idUsuario]);
    idPedido = pedidos[0]?.id_pedido;
    comprobar('El pedido quedo guardado en estado Pendiente', pedidos.length === 1 && pedidos[0].estado_pedido === 'Pendiente');
    const [detalle] = await conexion.execute('SELECT cantidad, color, mensaje_tarjeta FROM detalle_pedido WHERE id_pedido = ?', [idPedido]);
    comprobar('El detalle guardo cantidad, color y dedicatoria', detalle.length === 1 && detalle[0].cantidad === 2 && detalle[0].color === 'rojo' && detalle[0].mensaje_tarjeta === 'Feliz cumpleaños');
    comprobar('El inventario bajo de 10 a 8', (await inventario()) === 8);

    // POST: errores
    respuesta = await enviar(base, '/pedidos', { ...datosBuenos, idUsuario: '' });
    pagina = await respuesta.text();
    comprobar('Sin cliente muestra el error y no guarda', respuesta.status === 400 && pagina.includes('Debes elegir el cliente'));
    respuesta = await enviar(base, '/pedidos', { ...datosBuenos, cantidad: '0' });
    pagina = await respuesta.text();
    comprobar('Cantidad 0 muestra el error', respuesta.status === 400 && pagina.includes('mayor que cero'));
    respuesta = await enviar(base, '/pedidos', { ...datosBuenos, cantidad: '500' });
    pagina = await respuesta.text();
    comprobar('Pedir mas de lo que hay responde 409 con el mensaje de inventario', respuesta.status === 409 && pagina.includes('No hay suficiente inventario'));
    comprobar('Despues del error el inventario sigue en 8 (la transaccion se deshizo)', (await inventario()) === 8);
    const [total] = await conexion.execute('SELECT COUNT(*) AS n FROM pedidos WHERE id_usuario = ?', [idUsuario]);
    comprobar('Los pedidos con error no dejaron registros', total[0].n === 1);
    respuesta = await enviar(base, '/pedidos', { ...datosBuenos, idProducto: '99999999' });
    comprobar('Un producto que no existe responde 404', respuesta.status === 404);
    respuesta = await enviar(base, '/pedidos', { ...datosBuenos, mensajeTarjeta: '<script>alert(1)</script>', cantidad: '1' });
    pagina = await respuesta.text();
    comprobar('Una dedicatoria con etiquetas HTML se muestra como texto', !pagina.includes('<script>alert(1)</script>') && pagina.includes('&lt;script&gt;'));

    // Validacion de productos (longitud)
    respuesta = await enviar(base, '/productos', { nombreProducto: 'a'.repeat(151), idCategoria: String(categorias[0].id_categoria), precio: '1000' });
    pagina = await respuesta.text();
    comprobar('Un nombre de producto de mas de 150 letras muestra un mensaje claro', respuesta.status === 400 && pagina.includes('no puede pasar de 150 caracteres'));

    // GET detalle y filtro
    respuesta = await fetch(`${base}/pedidos/${idPedido}`);
    pagina = await respuesta.text();
    comprobar('GET /pedidos/:id muestra el detalle', respuesta.status === 200 && pagina.includes('Feliz cumpleaños') && pagina.includes('Caja de prueba'));
    respuesta = await fetch(`${base}/pedidos/99999999`);
    comprobar('Un pedido que no existe responde 404', respuesta.status === 404);
    respuesta = await fetch(`${base}/pedidos?estado=Pendiente`);
    pagina = await respuesta.text();
    comprobar('El filtro ?estado=Pendiente muestra el pedido', respuesta.status === 200 && pagina.includes(`Pedido N.° ${idPedido}`));
    respuesta = await fetch(`${base}/pedidos?estado=Entregado`);
    pagina = await respuesta.text();
    comprobar('El filtro ?estado=Entregado no muestra el pedido', respuesta.status === 200 && !pagina.includes(`Pedido N.° ${idPedido}<`));
    respuesta = await fetch(`${base}/pedidos?estado=Inventado`);
    comprobar('Un estado que no existe responde 400', respuesta.status === 400);

    // POST cambiar estado
    respuesta = await enviar(base, `/pedidos/${idPedido}/estado`, { estadoPedido: 'En proceso' });
    pagina = await respuesta.text();
    comprobar('Cambiar el estado muestra la confirmacion', respuesta.status === 200 && pagina.includes('Estado actualizado'));
    const [estado] = await conexion.execute('SELECT estado_pedido FROM pedidos WHERE id_pedido = ?', [idPedido]);
    comprobar('El nuevo estado quedo en la base de datos', estado[0].estado_pedido === 'En proceso');
    respuesta = await enviar(base, `/pedidos/${idPedido}/estado`, { estadoPedido: 'Volando' });
    comprobar('Un estado invalido responde 400', respuesta.status === 400);
    respuesta = await enviar(base, '/pedidos/99999999/estado', { estadoPedido: 'Enviado' });
    comprobar('Cambiar el estado de un pedido que no existe responde 404', respuesta.status === 404);
  } finally {
    // Limpieza de los datos de prueba
    await conexion.execute('DELETE FROM pedidos WHERE id_usuario = ?', [idUsuario]);
    await conexion.execute('DELETE FROM productos WHERE id_producto = ?', [idProducto]);
    await conexion.execute('DELETE FROM usuarios WHERE id_usuario = ?', [idUsuario]);
    servidor.close();
  }
  console.log(fallos === 0 ? '\nTodas las pruebas pasaron.' : `\nHubo ${fallos} fallo(s).`);
  await cerrarConexion();
  process.exitCode = fallos === 0 ? 0 : 1;
}

probar().catch(async (error) => {
  console.log(`Error en la prueba: ${error.message}`);
  await cerrarConexion();
  process.exit(1);
});
