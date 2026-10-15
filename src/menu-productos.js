// Menu en la terminal para probar el CRUD de Productos.
import readline from 'node:readline/promises';
import { stdin as entrada, stdout as salida } from 'node:process';
import { cerrarConexion } from './conexiones/conexion.js';
import {
  crearProducto,
  consultarProductos,
  consultarProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from './servicios/producto-servicio.js';

const lectura = readline.createInterface({ input: entrada, output: salida });

function mostrarProducto(producto) {
  console.log(
    `#${producto.idProducto} | ${producto.nombreProducto} | ` +
    `${producto.nombreCategoria} | $${producto.precio} | ` +
    `${producto.estadoProducto ? 'Activo' : 'Inactivo'}`,
  );
}

async function opcionCrear() {
  const nombreProducto = await lectura.question('Nombre del producto: ');
  const idCategoria = await lectura.question('Numero de la categoria: ');
  const precio = await lectura.question('Precio: ');
  const descripcion = await lectura.question('Descripcion (opcional): ');
  const producto = await crearProducto({
    nombreProducto,
    idCategoria: Number(idCategoria),
    precio: Number(precio),
    descripcion: descripcion || null,
  });
  console.log('Producto creado:');
  mostrarProducto(producto);
}

async function opcionListar() {
  const productos = await consultarProductos();
  if (productos.length === 0) {
    console.log('No hay productos registrados.');
    return;
  }
  productos.forEach(mostrarProducto);
}

async function opcionBuscar() {
  const id = await lectura.question('Numero del producto: ');
  const producto = await consultarProductoPorId(Number(id));
  if (producto === null) {
    console.log('No existe un producto con ese numero.');
    return;
  }
  mostrarProducto(producto);
}

async function opcionActualizar() {
  const id = await lectura.question('Numero del producto a actualizar: ');
  const nombreProducto = await lectura.question('Nuevo nombre (Enter para dejarlo igual): ');
  const precio = await lectura.question('Nuevo precio (Enter para dejarlo igual): ');
  const cambios = {};
  if (nombreProducto !== '') {
    cambios.nombreProducto = nombreProducto;
  }
  if (precio !== '') {
    cambios.precio = Number(precio);
  }
  const producto = await actualizarProducto(Number(id), cambios);
  if (producto === null) {
    console.log('No existe un producto con ese numero.');
    return;
  }
  console.log('Producto actualizado:');
  mostrarProducto(producto);
}

async function opcionEliminar() {
  const id = await lectura.question('Numero del producto a eliminar: ');
  const seElimino = await eliminarProducto(Number(id));
  console.log(seElimino ? 'Producto eliminado.' : 'No existe un producto con ese numero.');
}

const OPCIONES = {
  1: opcionCrear,
  2: opcionListar,
  3: opcionBuscar,
  4: opcionActualizar,
  5: opcionEliminar,
};

async function iniciarMenu() {
  let opcion = '';
  while (opcion !== '0') {
    console.log('\n=== EVERBLOOM - Productos ===');
    console.log('1. Crear producto');
    console.log('2. Ver todos los productos');
    console.log('3. Buscar producto por numero');
    console.log('4. Actualizar producto');
    console.log('5. Eliminar producto');
    console.log('0. Salir');
    opcion = await lectura.question('Elige una opcion: ');
    if (OPCIONES[opcion]) {
      try {
        await OPCIONES[opcion]();
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    } else if (opcion !== '0') {
      console.log('Opcion no valida.');
    }
  }
  lectura.close();
  await cerrarConexion();
}

iniciarMenu();
