/**
 * Container Routes
 *
 * API endpoints for container management.
 */

import { Router, Request, Response } from 'express';
import { DockerManager } from '../services/docker-manager.service';
import { Logger } from '../utils/logger';

export function createContainerRoutes(dockerManager: DockerManager): Router {
  const router = Router();
  const logger = new Logger('ContainerRoutes');

  /**
   * POST /containers/start
   * Start a new container
   */
  router.post('/start', async (req: Request, res: Response) => {
    try {
      const { projectId, buildId, dockerImage, serverInstanceId } = req.body;

      // Validation
      if (!projectId || !buildId || !dockerImage || !serverInstanceId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields',
        });
      }

      logger.info(`Starting container for project ${projectId}`);

      const result = await dockerManager.startContainer({
        projectId,
        buildId,
        dockerImage,
        serverInstanceId,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error(`Failed to start container: ${error.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  });

  /**
   * DELETE /containers/:id
   * Stop and remove a container
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      logger.info(`Stopping container ${id}`);

      await dockerManager.stopContainer(id);

      res.status(204).send();
    } catch (error) {
      logger.error(`Failed to stop container: ${error.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  });

  /**
   * GET /containers/:id
   * Get container status
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const status = await dockerManager.getContainerStatus(id);

      res.json(status);
    } catch (error) {
      logger.error(`Failed to get container status: ${error.message}`);
      res.status(404).json({
        error: 'Not Found',
        message: 'Container not found',
      });
    }
  });

  /**
   * GET /containers
   * List all running containers
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const containers = dockerManager.listContainers();

      res.json({
        containers,
        stats: dockerManager.getStats(),
      });
    } catch (error) {
      logger.error(`Failed to list containers: ${error.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  });

  return router;
}
