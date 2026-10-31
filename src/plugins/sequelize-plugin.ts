import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';
import envConfig from '../config/env.config';

declare module 'fastify' {
  interface FastifyInstance {
    sequelize: Sequelize;
  }
}

const requiresSSL =
  envConfig.DB_SSL ||
  (Boolean(envConfig.DATABASE_URL) &&
    (envConfig.DATABASE_URL.includes('sslmode=require') ||
      envConfig.DATABASE_URL.includes('.render.com')));

const dialectOptions = requiresSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

export const sequelize = envConfig.DATABASE_URL
  ? new Sequelize(envConfig.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    })
  : new Sequelize(
      envConfig.DB_NAME,
      envConfig.DB_USER,
      envConfig.DB_PASSWORD,
      {
        host: envConfig.DB_HOST,
        port: envConfig.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          underscored: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      }
    );

async function sequelizePlugin(fastify: FastifyInstance): Promise<void> {
  try {
    await sequelize.authenticate();
    fastify.log.info('PostgreSQL Database connected successfully via Sequelize.');
    fastify.decorate('sequelize', sequelize);
  } catch (error) {
    fastify.log.error(`Unable to connect to PostgreSQL database: ${error}`);
    throw error;
  }
}

export default fp(sequelizePlugin, {
  name: 'sequelize-plugin',
});
