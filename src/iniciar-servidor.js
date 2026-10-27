// Arranca el servidor web. Para verlo, abre http://localhost:3000 en el navegador.
import { crearAplicacion } from './servidor.js';

const PUERTO = Number(process.env.PUERTO_WEB) || 3000;

crearAplicacion().listen(PUERTO, () => {
  console.log(`EVERBLOOM funcionando en http://localhost:${PUERTO}`);
  console.log('Para detenerlo, pulsa Ctrl + C.');
});
