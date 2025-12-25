/**
 * Update Heartbeat Use Case - Application Layer
 *
 * Business logic for updating server heartbeat from Unity servers.
 */

import { Injectable, Inject } from '@nestjs/common';
import { IServerInstanceRepository } from '../../domain/repositories';

export interface UpdateHeartbeatRequest {
  serverId: string;
}

export interface UpdateHeartbeatResponse {
  serverId: string;
  lastHeartbeat: Date;
}

@Injectable()
export class UpdateHeartbeatUseCase {
  constructor(
    @Inject('IServerInstanceRepository')
    private readonly serverInstanceRepository: IServerInstanceRepository,
  ) {}

  async execute(request: UpdateHeartbeatRequest): Promise<UpdateHeartbeatResponse> {
    // Get server instance
    const server = await this.serverInstanceRepository.findById(request.serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    // Update heartbeat
    server.updateHeartbeat();
    await this.serverInstanceRepository.update(server);

    return {
      serverId: server.id,
      lastHeartbeat: server.lastHeartbeat!,
    };
  }
}
