-- Productos de ejemplo para el catalogo (EVERBLOOM). Ejecutar despues de datos-prueba.sql
USE everbloom;
INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio, estado_producto) VALUES
  (1, 'Rosa Dorada',  'Rosa eterna de satin color dorado', 24990, 1),
  (1, 'Rosa Eternal', 'Rosa eterna de satin que dura para siempre', 24990, 1),
  (3, 'Ramo Premium Everbloom', 'Ramo con varias flores eternas de satin', 45000, 1);
