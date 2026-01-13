import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Interceptor to ensure all Date objects are serialized as ISO 8601 strings
 * This ensures consistent date format across all API responses
 */
@Injectable()
export class DateSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Recursively serialize all Date objects to ISO 8601 strings
        return this.serializeDates(data);
      })
    );
  }

  /**
   * Recursively serialize Date objects to ISO 8601 strings
   */
  private serializeDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeDates(item));
    }

    // Handle objects
    if (typeof obj === "object") {
      const serialized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          serialized[key] = this.serializeDates(obj[key]);
        }
      }
      return serialized;
    }

    // Return primitive values as-is
    return obj;
  }
}
