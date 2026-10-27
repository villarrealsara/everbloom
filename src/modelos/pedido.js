// Clase Pedido: representa un pedido con sus lineas de detalle (tablas pedidos y detalle_pedido).

export const ESTADOS_PEDIDO = ['Pendiente', 'En proceso', 'Enviado', 'Entregado'];

export class Pedido {
  constructor({
    idPedido = null,
    idUsuario,
    cliente = null,
    fechaPedido = null,
    estadoPedido = 'Pendiente',
    total = 0,
    items = [],
  }) {
    this.idPedido = idPedido;
    this.idUsuario = idUsuario;
    this.cliente = cliente;
    this.fechaPedido = fechaPedido;
    this.estadoPedido = estadoPedido;
    this.total = total;
    // Cada item: { idProducto, cantidad, idEmpaque, color, mensajeTarjeta, ... }
    this.items = items;
  }

  /**
   * Convierte una fila de la tabla pedidos (con el nombre del cliente) en un objeto Pedido.
   */
  static desdeFila(fila) {
    return new Pedido({
      idPedido: fila.id_pedido,
      idUsuario: fila.id_usuario,
      cliente: fila.cliente || null,
      fechaPedido: fila.fecha_pedido,
      estadoPedido: fila.estado_pedido,
      total: Number(fila.total ?? 0),
    });
  }

  /**
   * Revisa los datos del pedido antes de guardarlo.
   * Devuelve una lista con los errores (vacia si todo esta bien).
   */
  validar() {
    const errores = [];
    if (!Number.isInteger(Number(this.idUsuario)) || Number(this.idUsuario) <= 0) {
      errores.push('Debes elegir el cliente que hace el pedido.');
    }
    if (!Array.isArray(this.items) || this.items.length === 0) {
      errores.push('El pedido debe tener al menos un producto.');
      return errores;
    }
    this.items.forEach((item, posicion) => {
      const numero = posicion + 1;
      if (!Number.isInteger(Number(item.idProducto)) || Number(item.idProducto) <= 0) {
        errores.push(`Producto ${numero}: debes elegir un producto.`);
      }
      if (!Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
        errores.push(`Producto ${numero}: la cantidad debe ser un número entero mayor que cero.`);
      }
      if (item.mensajeTarjeta && String(item.mensajeTarjeta).length > 255) {
        errores.push(`Producto ${numero}: la dedicatoria no puede pasar de 255 caracteres.`);
      }
      if (item.color && String(item.color).length > 50) {
        errores.push(`Producto ${numero}: el color no puede pasar de 50 caracteres.`);
      }
    });
    return errores;
  }
}
