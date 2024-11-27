//conexión a PostgreSQL

const { Client } = require('pg');

// Configuración de conexión a PostgreSQL
const client = new Client({
  host: 'localhost',     // Cambia a la dirección de tu base de datos si es necesario
  port: 5432,            // Puerto por defecto de PostgreSQL
  user: 'postgres',    // Tu nombre de usuario de PostgreSQL
  password: 'Nacho31121912', // Tu contraseña de PostgreSQL
  database: 'mi_base_datos', // Nombre de la base de datos
});

client.connect()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error de conexión', err.stack));

module.exports = client;