// Pagina que muestra la lista de productos (y el buscador).
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';

const IMAGENES = ['producto1.jpg', 'producto2.jpg', 'producto3.jpg'];

function crearTarjetaProducto(producto) {
  const estado = producto.estadoProducto ? 'Activo' : 'Inactivo';
  const claseEstado = producto.estadoProducto ? 'product-extra' : 'product-extra inactivo';
  const imagen = IMAGENES[producto.idProducto % IMAGENES.length];
  return `    <div class="product-card">
      <img src="/img/${imagen}" alt="${escaparHtml(producto.nombreProducto)}">
      <div class="product-info">
        <div class="product-meta">
          <span class="product-name">${escaparHtml(producto.nombreProducto)}</span>
          <span class="product-price">${formatearPrecio(producto.precio)}</span>
        </div>
        <span class="${claseEstado}">${escaparHtml(producto.nombreCategoria)} · N.° ${producto.idProducto} · ${estado}</span>
        <div class="product-actions">
          <a class="tag-detail" href="/productos/${producto.idProducto}/editar">Editar</a>
          <form method="post" action="/productos/${producto.idProducto}/eliminar"
                onsubmit="return confirm('¿Seguro que quieres eliminar este producto?');">
            <button type="submit" class="btn btn-primary">Eliminar</button>
          </form>
        </div>
      </div>
    </div>`;
}

/**
 * Arma la pagina de la lista. Si no hay productos muestra un mensaje.
 */
export function vistaListaProductos({ productos, busqueda = '' }) {
  const tarjetas = productos.length > 0
    ? productos.map(crearTarjetaProducto).join('\n')
    : '    <p class="sin-resultados">No se encontraron productos.</p>';
  const contenido = `    <div class="hero">
      <img src="/img/menu-principal-catalogo.jpg" alt="Flores Eternas EverBloom">
      <div class="hero-text">
        <p>Flores Eternas de Satín — Belleza que dura para siempre.</p>
      </div>
    </div>

    <div class="catalog-toolbar">
      <div class="catalog-search">
        <form method="get" action="/productos">
          🔍
          <input type="text" id="busqueda" name="busqueda" placeholder="Buscar flores eternas…"
                 aria-label="Buscar flores eternas" value="${escaparHtml(busqueda)}">
          <button type="submit" class="btn btn-primary">Buscar</button>
        </form>
        <div class="catalog-filters">
          <span>Filtrar por color</span>
          <span>|</span>
          <span>Precio ▼</span>
        </div>
      </div>
      <span class="catalog-link">Catálogo de productos</span>
    </div>

    <div class="products-grid">
${tarjetas}
    </div>`;
  return paginaBase({ titulo: 'Productos', contenido, claseCuerpo: 'pg-inicio' });
}
