import { NotFoundException } from "@nestjs/common";

/**
 * Custom exception for not found errors
 * Provides consistent error messages and structure
 */
export class EntityNotFoundException extends NotFoundException {
  constructor(entityName: string, identifier: string | number, identifierType: string = "ID") {
    super({
      message: `${entityName} with ${identifierType} ${identifier} not found`,
      entity: entityName,
      identifier: String(identifier),
      identifierType,
      error: "Not Found",
      statusCode: 404,
    });
  }
}
