-- AeroGuard database (MySQL / XAMPP)
-- Import: phpMyAdmin > Import > choose this file
CREATE DATABASE IF NOT EXISTS aeroguard CHARACTER SET utf8mb4;
USE aeroguard;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  user_type     ENUM('Admin','Security','DRRM','Faculty') NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(11) NULL,
  building      VARCHAR(80) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  incident_id     INT AUTO_INCREMENT PRIMARY KEY,
  device_id       INT NOT NULL,
  threat_level    ENUM('Gray','Yellow','Orange','Red') NOT NULL,
  pm25_value      DECIMAL(8,2) NULL,
  pm10_value      DECIMAL(8,2) NULL,
  temperature     DECIMAL(5,2) NULL,
  humidity        DECIMAL(5,2) NULL,
  confidence      DECIMAL(5,2) NULL,
  location        VARCHAR(120) NULL,
  response_action TEXT NULL,
  resolved        TINYINT(1) NOT NULL DEFAULT 0,
  resolved_at     DATETIME NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO incidents (device_id, threat_level, pm25_value, pm10_value, temperature, humidity, location)
VALUES (1,'Yellow',35.5,60.2,31.0,70.0,'Library 2F'),
       (2,'Red',180.0,250.4,48.5,40.0,'Engineering Lab');
