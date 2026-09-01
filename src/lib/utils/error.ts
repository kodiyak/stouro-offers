import type { ErrorCategory, ErrorCode } from "../enums";

export type AppErrorProps = {
  code: ErrorCode;
  message: string;
  category: ErrorCategory;
  details?: unknown;
  metadata?: Record<string, unknown>;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly code: ErrorCode;

  public readonly category: ErrorCategory;

  public readonly details?: unknown;
  public readonly metadata?: Record<string, unknown>;

  public readonly cause: unknown;

  constructor(props: AppErrorProps) {
    super(props.message);

    this.name = "AppError";

    this.code = props.code;

    this.category = props.category;

    this.details = props.details;
    this.metadata = props.metadata;

    this.cause = props.cause;

    Error.captureStackTrace?.(this, AppError);
  }

  toJSON() {
    return {
      name: this.name,

      code: this.code,
      category: this.category,

      message: this.message,

      details: this.details,
      metadata: this.metadata,

      cause: this.serializeCause(),

      stack: this.stack,
    };
  }

  private serializeCause(): unknown {
    if (!this.cause) {
      return undefined;
    }

    if (this.cause instanceof AppError) {
      return this.cause.toJSON();
    }

    if (this.cause instanceof Error) {
      return {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      };
    }

    return this.cause;
  }
}

export function isAppError(
  value: unknown,
  code?: ErrorCode,
): value is AppError {
  if (!(value instanceof AppError)) {
    return false;
  }

  return code ? value.code === code : true;
}
