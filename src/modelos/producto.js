// Clase Producto: representa una fila de la tabla productos.

export class Producto {
  constructor({
    idProducto = null,
    idCategoria,
    nombreProducto,
    descripcion = null,
    precio,
    imagen = null,
    estadoProducto = true,
    nombreCategoria = null,
  }) {
    this.idProducto = idProducto;
    this.idCategoria = idCategoria;
    this.nombreProducto = nombreProducto;
    this.descripcion = descripcion;
    this.precio = precio;
    this.imagen = imagen;
    this.estadoProducto = estadoProducto;
    this.nombreCategoria = nombreCategoria;
  }

  /**
   * Convierte una fila de la base de datos (con nombres en guion bajo)
   * en un objeto Producto (con nombres en camelCase).
   */
  static desdeFila(fila) {
    return new Producto({
      idProducto: fila.id_producto,
      idCategoria: fila.id_categoria,
      nombreProducto: fila.nombre_producto,
      descripcion: fila.descripcion,
      precio: Number(fila.precio),
      imagen: fila.imagen,
      estadoProducto: Boolean(fila.estado_producto),
      nombreCategoria: fila.nombre_categoria || null,
    });
  }

  /**
   * Revisa que los datos obligatorios esten bien.
   * Devuelve una lista con los errores (vacia si todo esta bien).
   */
  validar() {
    const errores = [];
    if (!this.nombreProducto || String(this.nombreProducto).trim() === '') {
      errores.push('El nombre del producto es obligatorio.');
    } else if (String(this.nombreProducto).trim().length > 150) {
      errores.push('El nombre del producto no puede pasar de 150 caracteres.');
    }
    if (!Number.isInteger(Number(this.idCategoria)) || Number(this.idCategoria) <= 0) {
      errores.push('La categoría debe ser un número válido.');
    }
    if (Number.isNaN(Number(this.precio)) || Number(this.precio) < 0) {
      errores.push('El precio debe ser un número mayor o igual a cero.');
    }
    return errores;
  }
}
