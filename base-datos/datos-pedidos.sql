-- Datos de prueba para el modulo de Pedidos (EVERBLOOM)
-- Ejecutar despues de everbloom.sql y datos-prueba.sql
USE everbloom;

INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('Administrador', 'Administra el sistema'),
  ('Cliente', 'Compra arreglos florales');

-- Contrasena de ejemplo: no sirve para iniciar sesion (el login se hace en la API de la evidencia AA5).
INSERT INTO usuarios (id_rol, nombres, apellidos, correo, contrasena, telefono) VALUES
  (2, 'Laura', 'Gomez', 'laura.gomez@ejemplo.com', 'sin-contrasena', '3001112233'),
  (2, 'Camilo', 'Rojas', 'camilo.rojas@ejemplo.com', 'sin-contrasena', '3004445566');

INSERT INTO empaques (nombre_empaque, precio_extra) VALUES
  ('Caja de regalo', 8000),
  ('Bolsa kraft', 3000),
  ('Cesta de mimbre', 12000);

INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio) VALUES
  (1, 'Rosa roja eterna', 'Rosa de satin color rojo', 45000),
  (2, 'Girasol decorativo', 'Girasol de satin', 38000),
  (3, 'Ramo primavera', 'Ramo mixto de satin', 62000);

INSERT INTO inventario (id_producto, cantidad)
  SELECT id_producto, 20 FROM productos WHERE nombre_producto IN ('Rosa roja eterna', 'Girasol decorativo', 'Ramo primavera');
