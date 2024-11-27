const express = require('express');
const cors = require('cors');
const eventosRoutes = require('./routes/eventos');
const reservasRoutes = require('./routes/reservas');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());  // Para poder recibir JSON en el cuerpo de las peticiones

// Rutas
app.use('/eventos', eventosRoutes);   // Maneja las rutas de eventos
app.use('/reservas', reservasRoutes); // Maneja las rutas de reservas

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});