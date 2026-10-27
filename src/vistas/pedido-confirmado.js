// Pagina de pedido confirmado: usa el diseno de la pantalla "Pedido confirmado" del prototipo.
// Tambien sirve para mostrar el detalle de un pedido y los mensajes de error del modulo.
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';

function lineasDetalle(items) {
  return items.map((i) => `        <p><strong>${i.cantidad} x ${escaparHtml(i.nombreProducto)}</strong> — ${formatearPrecio(i.precioUnitario)} c/u</p>
        <p>Empaque: ${escaparHtml(i.nombreEmpaque ?? 'Sin empaque especial')} · Color: ${escaparHtml(i.color ?? '—')}</p>
        <p>Dedicatoria: ${escaparHtml(i.mensajeTarjeta ?? '—')}</p>`).join('\n');
}

/**
 * Muestra el pedido (si hay) con un mensaje de exito o de error.
 */
export function vistaPedidoConfirmado({ titulo, mensaje, tipo = 'exito', pedido = null }) {
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const datosPedido = pedido
    ? `      <div class="client-info">
        <h3>Datos del pedido</h3>
        <p><strong>N.°:</strong> <span>${pedido.idPedido}</span></p>
        <p><strong>Cliente:</strong> <span>${escaparHtml(pedido.cliente)}</span></p>
        <p><strong>Estado:</strong> <span>${escaparHtml(pedido.estadoPedido)}</span></p>
${lineasDetalle(pedido.items)}
        <p><strong>Total:</strong> <span>${formatearPrecio(pedido.total)}</span></p>
      </div>`
    : '';
  const circulo = tipo === 'error'
    ? ''
    : `    <div class="confirm-right">
      <div class="check-circle">
        <img src="/img/verificado.jpg" alt="Verificado" data-respaldo="checkSvg">
        <svg id="checkSvg" class="check-svg" viewBox="0 0 100 100" style="display:none"><path d="M20 52 L42 72 L80 30" /></svg>
      </div>
    </div>`;
  const contenido = `  <div class="top-nav">
    <span class="brand">EverBloom</span>
    <nav><a href="/productos">Catálogo</a><a href="/pedidos">Pedidos</a><a href="/pedidos/nuevo">Nuevo pedido</a></nav>
  </div>

  <div class="confirm-section">
    <div class="confirm-left">
      <p class="confirm-intro">${tipo === 'error' ? 'Algo salió mal' : '¡Todo salió bien!'}</p>
      <h1 class="confirm-title">${escaparHtml(titulo)}</h1>
      <div class="mensaje mensaje-${tipo}" role="${tipo === 'error' ? 'alert' : 'status'}">${escaparHtml(mensaje)}</div>
      <div class="confirm-data"><p>Fecha: <strong>${fecha}</strong></p><p>Módulo: <strong>Pedidos</strong></p></div>
${datosPedido}
      <div class="confirm-actions">
        <a class="btn btn-outline" href="/pedidos/nuevo">Nuevo pedido</a>
        <a class="btn btn-primary" href="/pedidos">Ver pedidos</a>
      </div>
    </div>
${circulo}
  </div>`;
  return paginaBase({ titulo, contenido, claseCuerpo: 'pg-confirmado', barraMenu: false, pie: false });
}
