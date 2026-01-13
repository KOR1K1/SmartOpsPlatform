import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { AsyncLocalStorage } from "async_hooks";

/**
 * AsyncLocalStorage для хранения request ID в контексте запроса
 * Позволяет получить request ID из любого места в обработке запроса
 */
export const requestIdStorage = new AsyncLocalStorage<string>();

/**
 * Middleware для генерации и управления Request ID
 * 
 * Features:
 * - Генерирует уникальный request ID для каждого запроса
 * - Сохраняет request ID в AsyncLocalStorage для доступа из любого места
 * - Добавляет request ID в заголовок ответа X-Request-ID
 * - Поддерживает получение request ID из заголовка X-Request-ID (для трассировки)
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Получить request ID из заголовка или сгенерировать новый
    const requestId = req.headers["x-request-id"] as string || uuidv4();

    // Сохранить request ID в AsyncLocalStorage для доступа из любого места
    requestIdStorage.run(requestId, () => {
      // Добавить request ID в заголовок ответа
      res.setHeader("X-Request-ID", requestId);

      // Добавить request ID в объект запроса для удобства
      (req as any).requestId = requestId;

      next();
    });
  }
}

/**
 * Получить текущий request ID из контекста
 * Используется в сервисах, контроллерах и других местах
 */
export function getRequestId(): string | undefined {
  return requestIdStorage.getStore();
}
