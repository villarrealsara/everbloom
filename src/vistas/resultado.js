// Pagina de resultado: confirmacion de guardado, de cambios, de eliminacion o error.
// Tiene el mismo diseno de la pantalla "Pedido confirmado" del prototipo.
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';

function crearDetalleProducto(producto) {
  if (!producto) {
    return '';
  }
  return `      <div class="client-info">
        <h3>Datos del producto</h3>
        <p><strong>N.°:</strong> <span>${producto.idProducto}</span></p>
        <p><strong>Nombre:</strong> <span>${escaparHtml(producto.nombreProducto)}</span></p>
        <p><strong>Categoría:</strong> <span>${escaparHtml(producto.nombreCategoria)}</span></p>
        <p><strong>Precio:</strong> <span>${formatearPrecio(producto.precio)}</span></p>
      </div>`;
}

/**
 * Muestra un mensaje de exito o de error y, si hay, los datos del producto.
 * El tipo puede ser 'exito' o 'error'.
 */
export function vistaResultado({ titulo, mensaje, tipo = 'exito', producto = null }) {
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const circulo = tipo === 'error'
    ? ''
    : `    <div class="confirm-right">
      <div class="check-circle">
        <img src="/img/verificado.jpg" alt="Verificado" data-respaldo="checkSvg">
        <svg id="checkSvg" class="check-svg" viewBox="0 0 100 100" style="display:none">
          <path d="M20 52 L42 72 L80 30" />
        </svg>
      </div>
    </div>`;
  const contenido = `  <div class="top-nav">
    <span class="brand">EverBloom</span>
    <nav>
      <a href="/productos">Catálogo</a>
      <a href="/productos/nuevo">Nuevo producto</a>
    </nav>
  </div>

  <div class="confirm-section">
    <div class="confirm-left">
      <p class="confirm-intro">${tipo === 'error' ? 'Algo salió mal' : '¡Todo salió bien!'}</p>
      <h1 class="confirm-title">${escaparHtml(titulo)}</h1>

      <div class="mensaje mensaje-${tipo}" role="${tipo === 'error' ? 'alert' : 'status'}">
        ${escaparHtml(mensaje)}
      </div>

      <div class="confirm-data">
        <p>Fecha: <strong>${fecha}</strong></p>
        <p>Módulo: <strong>Productos</strong></p>
      </div>

${crearDetalleProducto(producto)}

      <div class="confirm-actions">
        <a class="btn btn-outline" href="/productos/nuevo">Agregar otro producto</a>
        <a class="btn btn-primary" href="/productos">Volver al catálogo</a>
      </div>
    </div>
${circulo}
  </div>`;
  return paginaBase({ titulo, contenido, claseCuerpo: 'pg-confirmado', barraMenu: false, pie: false });
}
