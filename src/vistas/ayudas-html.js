// Ayudas para escribir paginas HTML de forma segura.

/**
 * Cambia los caracteres especiales del texto para que no se ejecuten como HTML.
 * Asi, si alguien escribe una etiqueta en el formulario, se muestra como texto.
 */
export function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Da formato de pesos colombianos a un numero. Ejemplo: 45000 -> $ 45.000
 */
export function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString('es-CO')}`;
}
