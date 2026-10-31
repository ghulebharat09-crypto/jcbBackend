import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import envConfig from './config/env.config';
import sequelizePlugin from './plugins/sequelize-plugin';
import modelInitializationPlugin from './plugins/modelinitializer-plugin';
import rootRoutes from './routes/index';
import { seedDatabase } from './seeders/admin.seeder';

export const app = fastify({
  logger:
    envConfig.NODE_ENV === 'production'
      ? { level: envConfig.LOG_LEVEL }
      : {
          level: envConfig.LOG_LEVEL,
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        },
});

// --------------------
// Core Plugins (CORS, Multipart)
// --------------------
async function registerCorePlugins() {
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return cb(null, true);
      // Allow localhost (Flutter web/dev)
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Multipart upload plugin
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  });
}

// --------------------
// Health Check Route
// --------------------
function setupHealthCheck() {
  app.get('/health-check', async (request, reply) => {
    try {
      await app.sequelize.authenticate();
      return reply.status(200).send({
        status: 200,
        message: 'MySQL Connected successfully',
        name: 'JCB Fleet Management API',
        version: '1.0.0',
        dependencies: [
          {
            type: 'database-mysql',
            status: true,
            required: true,
          },
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(503).send({
        status: 503,
        message: 'MySQL connection failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get('/auth/health-check', async (request, reply) => {
    try {
      await app.sequelize.authenticate();
      return reply.status(200).send({
        status: 200,
        message: 'MySQL Connected',
        name: 'Auth API',
        version: '1.0.0',
      });
    } catch (error) {
      return reply.status(503).send({
        status: 503,
        message: 'MySQL connection failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

// --------------------
// Route Registration
// --------------------
async function registerRoutes() {
  await app.register(rootRoutes, { prefix: '/api/v1' });
}

// --------------------
// Start Server
// --------------------
export const startServer = async () => {
  try {
    setupHealthCheck();
    await registerCorePlugins();
    await app.register(sequelizePlugin);
    await app.register(modelInitializationPlugin);

    // Sync database tables
    await app.sequelize.sync({ alter: false });
    app.log.info('All database tables synchronized successfully.');

    // Seed admin & defaults
    await seedDatabase();

    await registerRoutes();

    await app.listen({ port: envConfig.PORT, host: envConfig.HOST });
    app.log.info(`🚀 JCB Fleet Backend Server running on http://${envConfig.HOST}:${envConfig.PORT}`);
    app.log.info(`🩺 Health check available at http://${envConfig.HOST}:${envConfig.PORT}/health-check`);
    app.log.info(`📡 API root available at http://${envConfig.HOST}:${envConfig.PORT}/api/v1`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
