-- =============================================
-- LokiCare - Esquema de Base de Datos
-- Ejecutar en phpMyAdmin o MySQL CLI
-- =============================================

CREATE DATABASE IF NOT EXISTS lokicare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lokicare;

-- Propietarios
CREATE TABLE propietarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(200),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mascotas
CREATE TABLE mascotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propietario_id INT NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  especie VARCHAR(30) NOT NULL,
  raza VARCHAR(50),
  sexo ENUM('Macho', 'Hembra') NOT NULL,
  color VARCHAR(30),
  fecha_nacimiento DATE,
  microchip VARCHAR(50),
  foto_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propietario_id) REFERENCES propietarios(id)
);

-- Vacunas
CREATE TABLE vacunas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT NOT NULL,
  fecha DATE NOT NULL,
  producto VARCHAR(100) NOT NULL,
  veterinario VARCHAR(100),
  proxima DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
);

-- Desparasitaciones
CREATE TABLE desparasitaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT NOT NULL,
  tipo ENUM('interna', 'externa') NOT NULL,
  fecha DATE NOT NULL,
  producto VARCHAR(100) NOT NULL,
  proxima DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
);

-- Baños
CREATE TABLE banos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(20),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
);

-- =============================================
-- Datos iniciales migrados desde mascota.json
-- =============================================

INSERT INTO propietarios (nombre, telefono, direccion, email) VALUES
('Luis Forero', '3163449117', 'Cra 121a 47a-46', 'luisfoguz1198@gmail.com');

INSERT INTO mascotas (propietario_id, nombre, especie, raza, sexo, color, fecha_nacimiento, microchip) VALUES
(1, 'Loki', 'Canino', 'Pomerania', 'Macho', '', '2023-07-04', '');

INSERT INTO vacunas (mascota_id, fecha, producto, veterinario, proxima) VALUES
(1, '2023-12-06', 'Canigen MHA Puppy', 'Daniel Gutierrez', '2023-12-27'),
(1, '2023-12-17', 'Canigen MHA PPI/L', 'Daniel Gutierrez', '2024-01-17'),
(1, '2024-01-17', 'Nobivac DHPPI + Nobivac RL', 'N/A', '2025-01-17'),
(1, '2025-03-08', 'Canigen LR + MHA PPI', 'N/A', '2026-03-08');

INSERT INTO desparasitaciones (mascota_id, tipo, fecha, producto, proxima) VALUES
(1, 'interna', '2023-11-30', 'Rondel Puppy', '2023-11-30'),
(1, 'interna', '2024-03-30', 'Simparic Trio', '2024-07-30'),
(1, 'interna', '2024-07-20', 'Canisround', '2024-09-20'),
(1, 'interna', '2024-11-20', 'Simparic Trio', '2024-11-20'),
(1, 'interna', '2025-03-02', 'Ya se lecho', '2025-06-02'),
(1, 'interna', '2025-06-27', 'Galacal Pool', '2025-09-27'),
(1, 'interna', '2025-08-06', 'Nexgard', '2025-08-06'),
(1, 'interna', '2025-10-14', 'Rondel Puppy', '2026-01-14'),
(1, 'externa', '2023-11-30', 'Nexgard', '2024-01-30'),
(1, 'externa', '2024-07-20', 'Simparic Trio', '2024-07-30'),
(1, 'externa', '2024-09-20', 'Simparic Trio', '2024-11-20'),
(1, 'externa', '2025-03-02', 'N/A', NULL),
(1, 'externa', '2025-08-06', 'Nexgard', '2025-08-12');

INSERT INTO banos (mascota_id, fecha, hora, observaciones) VALUES
(1, '2025-10-01', '11:00 AM', 'Cita para Baño y Grooming.');
