// Pagina que muestra la lista de pedidos, con filtro por estado y cambio de estado.
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';
import { ESTADOS_PEDIDO } from '../modelos/pedido.js';

function filaPedido(pedido) {
  const fecha = new Date(pedido.fechaPedido).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const opciones = ESTADOS_PEDIDO
    .map((e) => `<option value="${e}"${e === pedido.estadoPedido ? ' selected' : ''}>${e}</option>`)
    .join('');
  return `    <div class="product-card">
      <div class="product-info">
        <div class="product-meta">
          <span class="product-name">Pedido N.° ${pedido.idPedido}</span>
          <span class="product-price">${formatearPrecio(pedido.total)}</span>
        </div>
        <span class="product-extra">${escaparHtml(pedido.cliente)} · ${fecha} · ${escaparHtml(pedido.estadoPedido)}</span>
        <div class="product-actions">
          <a class="tag-detail" href="/pedidos/${pedido.idPedido}">Ver detalle</a>
          <form method="post" action="/pedidos/${pedido.idPedido}/estado" class="form-estado">
            <select name="estadoPedido" aria-label="Estado del pedido">${opciones}</select>
            <button type="submit" class="btn btn-primary">Cambiar</button>
          </form>
        </div>
      </div>
    </div>`;
}

/**
 * Arma la pagina de la lista de pedidos.
 */
export function vistaListaPedidos({ pedidos, estado = '' }) {
  const tarjetas = pedidos.length > 0
    ? pedidos.map(filaPedido).join('\n')
    : '    <p class="sin-resultados">No se encontraron pedidos.</p>';
  const opcionesFiltro = ['', ...ESTADOS_PEDIDO]
    .map((e) => `<option value="${e}"${e === estado ? ' selected' : ''}>${e === '' ? 'Todos los estados' : e}</option>`)
    .join('');
  const contenido = `    <div class="catalog-toolbar">
      <div class="catalog-search">
        <form method="get" action="/pedidos">
          <label for="estado">Filtrar por estado</label>
          <select id="estado" name="estado">${opcionesFiltro}</select>
          <button type="submit" class="btn btn-primary">Filtrar</button>
        </form>
      </div>
      <a class="btn btn-primary" href="/pedidos/nuevo">Nuevo pedido</a>
    </div>

    <div class="products-grid">
${tarjetas}
    </div>`;
  return paginaBase({ titulo: 'Pedidos', contenido, claseCuerpo: 'pg-inicio' });
}
