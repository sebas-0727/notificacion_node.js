const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const dbConfig = {
  host: 'beztemoivhfz3gme6cg2-mysql.services.clever-cloud.com',
  user: 'ueimrvxlppm556x2',
  password: 'g4RxFIaDLiTjAdDY1DZZ',
  database: 'beztemoivhfz3gme6cg2',
  port: 3306
};

// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para obtener el último número de reporte
async function getLastReportNumber() {
  try {
    const [rows] = await pool.query('SELECT MAX(numero) as lastNumber FROM reporte');
    return rows[0].lastNumber || 0;
  } catch (error) {
    console.error('Error al obtener el último número de reporte:', error);
    return 0;
  }
}

// Configuración del servidor Express y Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Lógica para monitorear la base de datos
async function monitorDatabase() {
  let lastKnownNumber = await getLastReportNumber();
  console.log('Iniciando monitoreo. Último número conocido:', lastKnownNumber);

  setInterval(async () => {
    try {
      const currentLastNumber = await getLastReportNumber();
      if (currentLastNumber > lastKnownNumber) {
        console.log('¡ALERTA! Nuevo reporte detectado:', currentLastNumber);

        // Emitir evento a todos los clientes conectados
        io.emit('new-report', {
          title: '¡ALERTA!',
          message: `Nuevo reporte detectado: ${currentLastNumber}`
        });

        lastKnownNumber = currentLastNumber;
      }
    } catch (error) {
      console.error('Error al monitorear la base de datos:', error);
    }
  }, 5000); // Revisa cada 5 segundos
}

// Iniciar el monitoreo
monitorDatabase();

// Iniciar el servidor
const PORT = process.env.PORT || 5500s;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
