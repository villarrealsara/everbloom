// Pagina con el formulario para registrar un pedido.
// Usa el mismo diseno de la pantalla "Realizar pedido" del prototipo.
import { paginaBase } from './pagina-base.js';
import { escaparHtml, formatearPrecio } from './ayudas-html.js';

function opcionesClientes(clientes, seleccionado) {
  return clientes
    .map((c) => `            <option value="${c.idUsuario}"${Number(seleccionado) === c.idUsuario ? ' selected' : ''}>${escaparHtml(c.nombre)} (${escaparHtml(c.correo)})</option>`)
    .join('\n');
}

function opcionesProductos(productos, seleccionado) {
  return productos
    .map((p) => `            <option value="${p.idProducto}"${Number(seleccionado) === p.idProducto ? ' selected' : ''}>${escaparHtml(p.nombreProducto)} — ${formatearPrecio(p.precio)} (disponibles: ${p.disponibles})</option>`)
    .join('\n');
}

function opcionesEmpaques(empaques, seleccionado) {
  return empaques
    .map((e) => `            <option value="${e.idEmpaque}"${Number(seleccionado) === e.idEmpaque ? ' selected' : ''}>${escaparHtml(e.nombreEmpaque)} (+ ${formatearPrecio(e.precioExtra)})</option>`)
    .join('\n');
}

function bloqueErrores(errores) {
  if (errores.length === 0) {
    return '';
  }
  const items = errores.map((e) => `            <li>${escaparHtml(e)}</li>`).join('\n');
  return `        <div class="mensaje mensaje-error" role="alert">
          <strong>Revisa los datos:</strong>
          <ul>
${items}
          </ul>
        </div>`;
}

/**
 * Arma el formulario del pedido. "datos" trae lo que la persona ya habia escrito (si hubo errores).
 */
export function vistaFormularioPedido({ clientes, productos, empaques, datos = {}, errores = [] }) {
  const contenido = `  <div class="order-header">
    <div class="brand">EverBloom <small style="font-size:.65em;font-weight:300;letter-spacing:.15em;">FLORES ETERNAS</small></div>
    <h1>Realizar pedido 🌸</h1>
    <p>Elige el cliente y el arreglo, y personaliza el empaque, el color y la dedicatoria.</p>
  </div>

  <div class="order-body">
    <div class="order-summary">
      <h2>¿Cómo funciona?</h2>
      <div class="summary-item"><p>1. Elige el cliente</p></div>
      <hr class="summary-divider" />
      <div class="summary-item"><p>2. Elige el arreglo y la cantidad</p></div>
      <hr class="summary-divider" />
      <div class="summary-item"><p>3. Personaliza: empaque, color y tarjeta</p></div>
      <hr class="summary-divider" />
      <div class="summary-item"><p>El inventario baja automáticamente al confirmar el pedido.</p></div>
    </div>

    <div class="order-form-box">
${bloqueErrores(errores)}
      <form method="post" action="/pedidos">
        <div class="form-group">
          <label for="idUsuario">Cliente *</label>
          <select id="idUsuario" name="idUsuario">
            <option value="">Elige un cliente</option>
${opcionesClientes(clientes, datos.idUsuario)}
          </select>
        </div>
        <div class="form-group">
          <label for="idProducto">Arreglo floral *</label>
          <select id="idProducto" name="idProducto">
            <option value="">Elige un arreglo</option>
${opcionesProductos(productos, datos.idProducto)}
          </select>
        </div>
        <div class="form-group">
          <label for="cantidad">Cantidad *</label>
          <input type="number" id="cantidad" name="cantidad" min="1" step="1" value="${escaparHtml(datos.cantidad ?? 1)}">
        </div>
        <div class="form-group">
          <label for="idEmpaque">Empaque</label>
          <select id="idEmpaque" name="idEmpaque">
            <option value="">Sin empaque especial</option>
${opcionesEmpaques(empaques, datos.idEmpaque)}
          </select>
        </div>
        <div class="form-group">
          <label for="color">Color preferido</label>
          <input type="text" id="color" name="color" maxlength="50" placeholder="Ej: rojo" value="${escaparHtml(datos.color)}">
        </div>
        <div class="form-group">
          <label for="mensajeTarjeta">Dedicatoria de la tarjeta</label>
          <textarea id="mensajeTarjeta" name="mensajeTarjeta" rows="3" maxlength="255" placeholder="Escribe un mensaje">${escaparHtml(datos.mensajeTarjeta)}</textarea>
        </div>
        <div class="order-actions">
          <a class="btn btn-outline" href="/pedidos">Cancelar</a>
          <button type="submit" class="btn btn-primary">Confirmar pedido</button>
        </div>
      </form>
    </div>
  </div>

  <div class="btn-back"><a class="btn btn-outline" href="/pedidos">Atrás</a></div>
  <div class="order-footer">2024 - Everbloom © — Política de Privacidad · Términos y Condiciones</div>`;
  return paginaBase({ titulo: 'Realizar pedido', contenido, claseCuerpo: 'pg-pedido', barraMenu: false, pie: false });
}
