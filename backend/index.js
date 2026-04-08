const http = require('node:http');
const path = require('node:path');

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const { connectDB, disconnectDB } = require('./config/database');
const env = require('./config/env');
const swaggerDocument = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const apiRoutes = require('./routes');
const { closeRedis, initRedis } = require('./services/redisClient');
const initSocket = require('./services/socketService');
const { closeSocket } = initSocket;
const logger = require('./utils/logger');

const createSwaggerHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTT API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api-docs/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true
    });
  </script>
</body>
</html>`;

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      message: 'Service healthy',
    });
  });

  app.get('/api-docs/openapi.json', (_req, res) => {
    res.json(swaggerDocument);
  });
  app.get('/api-docs', (_req, res) => {
    res.type('html').send(createSwaggerHtml());
  });

  app.use('/api/v1', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = createApp();
const server = http.createServer(app);
let socketInitialized = false;

const startServer = async () => {
  await connectDB();
  await initRedis();
  if (!socketInitialized) {
    initSocket(server);
    socketInitialized = true;
  }

  return new Promise((resolve) => {
    server.listen(env.port, () => {
      logger.info(`Server started on port ${env.port}`);
      resolve(server);
    });
  });
};

const stopServer = async () => {
  await closeSocket();
  socketInitialized = false;
  await closeRedis();
  await disconnectDB();

  if (!server.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  server,
  createApp,
  startServer,
  stopServer,
};
