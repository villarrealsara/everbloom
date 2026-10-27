// Pagina con el formulario para crear o editar un producto.
// Tiene el mismo diseno de la pantalla "Realizar pedido" del prototipo.
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';

function crearOpcionesCategoria(categorias, idSeleccionado) {
  return categorias
    .map((categoria) => {
      const seleccionada = Number(idSeleccionado) === categoria.idCategoria ? ' selected' : '';
      return `            <option value="${categoria.idCategoria}"${seleccionada}>${escaparHtml(categoria.nombreCategoria)}</option>`;
    })
    .join('\n');
}

function crearBloqueErrores(errores) {
  if (errores.length === 0) {
    return '';
  }
  const items = errores.map((error) => `            <li>${escaparHtml(error)}</li>`).join('\n');
  return `        <div class="mensaje mensaje-error" role="alert">
          <strong>Revisa los datos:</strong>
          <ul>
${items}
          </ul>
        </div>`;
}

/**
 * Arma el resumen que aparece a la izquierda con lo que la persona lleva escrito.
 */
function crearResumen(producto, categorias) {
  const categoria = categorias.find((c) => c.idCategoria === Number(producto.idCategoria));
  const nombre = producto.nombreProducto ? escaparHtml(producto.nombreProducto) : 'Producto nuevo';
  const valorPrecio = Number(producto.precio);
  const precio = producto.precio === '' || producto.precio === undefined || producto.precio === null
    || Number.isNaN(valorPrecio)
    ? 'Por definir'
    : formatearPrecio(valorPrecio);
  return `      <div class="order-summary">
        <h2>Resumen del producto.</h2>
        <div class="summary-item">
          <p>🌷 ${nombre}</p>
          <span class="link">Categoría: ${categoria ? escaparHtml(categoria.nombreCategoria) : 'Por elegir'}</span>
        </div>
        <hr class="summary-divider" />
        <div class="summary-item">
          <p>Precio:</p>
          <span class="link"><strong>${precio}</strong></span>
        </div>
        <hr class="summary-divider" />
        <div class="summary-item">
          <p>Campos obligatorios:</p>
          <span class="link">Nombre, categoría y precio</span>
        </div>
      </div>`;
}

/**
 * Arma el formulario. El formulario se envia con method="post" a la ruta "accion".
 * Si hay errores, los muestra y deja escritos los datos que la persona ya habia puesto.
 */
export function vistaFormularioProducto({ titulo, accion, producto, categorias, errores = [], mostrarEstado = false }) {
  const casillaEstado = mostrarEstado
    ? `          <div class="form-group casilla">
            <input type="checkbox" id="estadoProducto" name="estadoProducto"${producto.estadoProducto ? ' checked' : ''}>
            <label for="estadoProducto">Producto activo</label>
          </div>`
    : '';
  const contenido = `  <div class="order-header">
    <div class="brand">EverBloom <small style="font-size:.65em;font-weight:300;letter-spacing:.15em;">FLORES ETERNAS</small></div>
    <h1>${escaparHtml(titulo)} 🌸</h1>
    <p>Completa los datos a continuación para guardar el producto en el catálogo de EverBloom.</p>
  </div>

  <div class="order-body">
${crearResumen(producto, categorias)}

    <div class="order-form-box">
${crearBloqueErrores(errores)}
      <form method="post" action="${accion}">
        <div class="form-group">
          <label for="nombreProducto">Nombre del producto *</label>
          <input type="text" id="nombreProducto" name="nombreProducto" maxlength="150"
                 placeholder="Nombre del producto" value="${escaparHtml(producto.nombreProducto)}">
        </div>
        <div class="form-group">
          <label for="idCategoria">Categoría *</label>
          <select id="idCategoria" name="idCategoria">
            <option value="">Elige una categoría</option>
${crearOpcionesCategoria(categorias, producto.idCategoria)}
          </select>
        </div>
        <div class="form-group">
          <label for="precio">Precio (en pesos) *</label>
          <input type="number" id="precio" name="precio" min="0" step="0.01"
                 placeholder="Ej: 45000" value="${escaparHtml(producto.precio)}">
        </div>
        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows="3"
                    placeholder="Descripción del producto">${escaparHtml(producto.descripcion)}</textarea>
        </div>
${casillaEstado}
        <div class="order-actions">
          <a class="btn btn-outline" href="/productos">Cancelar</a>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  </div>

  <div class="btn-back">
    <a class="btn btn-outline" href="/productos">Atrás</a>
  </div>

  <div class="order-footer">
    2024 - Everbloom © — Política de Privacidad · Términos y Condiciones
  </div>`;
  return paginaBase({ titulo, contenido, claseCuerpo: 'pg-pedido', barraMenu: false, pie: false });
}
