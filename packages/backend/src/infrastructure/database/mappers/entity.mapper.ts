/**
 * Entity Mappers - Infrastructure Layer
 *
 * Converts between domain entities and ORM entities.
 */

import { User, Studio, Project, Build, ServerInstance } from '../../../domain/entities';
import {
  UserOrm,
  StudioOrm,
  ProjectOrm,
  BuildOrm,
  ServerInstanceOrm,
} from '../entities';

export class EntityMapper {
  // User mappers
  static toDomainUser(orm: UserOrm): User {
    return new User(
      orm.id,
      orm.email,
      orm.passwordHash,
      orm.studioId,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrmUser(domain: User): UserOrm {
    const orm = new UserOrm();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.studioId = domain.studioId;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  // Studio mappers
  static toDomainStudio(orm: StudioOrm): Studio {
    return new Studio(
      orm.id,
      orm.name,
      orm.apiKey,
      orm.maxServers,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrmStudio(domain: Studio): StudioOrm {
    const orm = new StudioOrm();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.apiKey = domain.apiKey;
    orm.maxServers = domain.maxServers;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  // Project mappers
  static toDomainProject(orm: ProjectOrm): Project {
    return new Project(
      orm.id,
      orm.studioId,
      orm.name,
      orm.description,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrmProject(domain: Project): ProjectOrm {
    const orm = new ProjectOrm();
    orm.id = domain.id;
    orm.studioId = domain.studioId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  // Build mappers
  static toDomainBuild(orm: BuildOrm): Build {
    return new Build(
      orm.id,
      orm.projectId,
      orm.version,
      orm.s3Key,
      orm.dockerImage,
      orm.status as any,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrmBuild(domain: Build): BuildOrm {
    const orm = new BuildOrm();
    orm.id = domain.id;
    orm.projectId = domain.projectId;
    orm.version = domain.version;
    orm.s3Key = domain.s3Key;
    orm.dockerImage = domain.dockerImage;
    orm.status = domain.status;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  // ServerInstance mappers
  static toDomainServerInstance(orm: ServerInstanceOrm): ServerInstance {
    return new ServerInstance(
      orm.id,
      orm.projectId,
      orm.buildId,
      orm.status as any,
      orm.containerId,
      orm.ip,
      orm.port,
      orm.lastHeartbeat,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrmServerInstance(domain: ServerInstance): ServerInstanceOrm {
    const orm = new ServerInstanceOrm();
    orm.id = domain.id;
    orm.projectId = domain.projectId;
    orm.buildId = domain.buildId;
    orm.status = domain.status;
    orm.containerId = domain.containerId;
    orm.ip = domain.ip;
    orm.port = domain.port;
    orm.lastHeartbeat = domain.lastHeartbeat;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
