/**
 * Orchestrator Service Main Entry Point
 *
 * Manages Unity server Docker containers.
 */

import express from 'express';
import dotenv from 'dotenv';
import { DockerManager } from './services/docker-manager.service';
import { createContainerRoutes } from './routes/containers.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Orchestrator');

// Configuration
const PORT = parseInt(process.env.ORCHESTRATOR_PORT || '3001', 10);
const HOST = process.env.ORCHESTRATOR_HOST || '0.0.0.0';
const ORCHESTRATOR_SECRET = process.env.ORCHESTRATOR_SECRET || 'change-me';
const PORT_RANGE_START = parseInt(process.env.UNITY_SERVER_PORT_RANGE_START || '7000', 10);
const PORT_RANGE_END = parseInt(process.env.UNITY_SERVER_PORT_RANGE_END || '8000', 10);
const PUBLIC_IP = process.env.PUBLIC_IP || 'localhost';
const NETWORK_NAME = process.env.UNITY_SERVER_NETWORK || 'game-backend-network';
const CPU_LIMIT = parseFloat(process.env.CONTAINER_CPU_LIMIT || '1');
const MEMORY_LIMIT = process.env.CONTAINER_MEMORY_LIMIT || '2g';
const HEALTH_CHECK_INTERVAL = parseInt(
  process.env.HEALTH_CHECK_INTERVAL_SECONDS || '30',
  10,
) * 1000;

// Initialize Docker Manager
const dockerManager = new DockerManager({
  portRangeStart: PORT_RANGE_START,
  portRangeEnd: PORT_RANGE_END,
  publicIp: PUBLIC_IP,
  networkName: NETWORK_NAME,
  cpuLimit: CPU_LIMIT,
  memoryLimit: MEMORY_LIMIT,
});

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stats: dockerManager.getStats(),
  });
});

// Protected routes (require auth)
app.use('/containers', authMiddleware(ORCHESTRATOR_SECRET), createContainerRoutes(dockerManager));

// Start periodic health checks
setInterval(async () => {
  try {
    await dockerManager.cleanupUnhealthyContainers();
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
  }
}, HEALTH_CHECK_INTERVAL);

// Start server
app.listen(PORT, HOST, () => {
  logger.info(`🚀 Orchestrator service running on http://${HOST}:${PORT}`);
  logger.info(`📦 Managing Unity servers on ports ${PORT_RANGE_START}-${PORT_RANGE_END}`);
  logger.info(`🌍 Public IP: ${PUBLIC_IP}`);
  logger.info(`🔒 Authentication: ${ORCHESTRATOR_SECRET === 'change-me' ? '⚠️  INSECURE (using default secret)' : '✓ Enabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
