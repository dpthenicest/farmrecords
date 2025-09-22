import { NextResponse } from "next/server";

// --- Error Response Definitions ---

/**
 * Defines a standardized set of API error codes for consistent error handling.
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "INSUFFICIENT_PERMISSIONS"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR";

/**
 * Represents a detailed breakdown of an API error,
 * often used for validation failures.
 */
export interface ErrorDetail {
  field?: string;
  message: string;
}

/**
 * Defines the options for creating a standardized API error response.
 */
export interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  details?: ErrorDetail[];
  status?: number;
}

/**
 * Utility for creating consistent API error responses.
 */
export function apiError({
  code,
  message,
  details,
  status = 400,
}: ApiErrorOptions) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

// Common error helpers
export const Errors = {
  Validation: (details?: ErrorDetail[]) =>
    apiError({
      code: "VALIDATION_ERROR",
      message: "Invalid input data",
      details,
      status: 400,
    }),

  Unauthorized: () =>
    apiError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    }),

  Forbidden: () =>
    apiError({
      code: "INSUFFICIENT_PERMISSIONS",
      message: "You don't have permission to access this resource",
      status: 403,
    }),

  NotFound: () =>
    apiError({
      code: "RESOURCE_NOT_FOUND",
      message: "The requested resource was not found",
      status: 404,
    }),

  Internal: () =>
    apiError({
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred",
      status: 500,
    }),
};

// --- Success Response Definitions ---

/**
 * Defines the options for creating a standardized API success response.
 */
export interface ApiSuccessOptions<T> {
  /** The data to be returned in the response. */
  data?: T;
  /** A user-friendly message for the success response. */
  message: string;
  /** The HTTP status code to return. */
  status: number;
  /** An optional object for pagination metadata. */
  pagination?: Record<string, any>;
}

/**
 * A utility for creating consistent, standardized API success responses.
 * This is a low-level builder function.
 * @template T The type of the data payload.
 * @param {ApiSuccessOptions<T>} options The options for the success response.
 * @returns {NextResponse} A Next.js server response object with a JSON body.
 */
export function apiSuccess<T>({
  data,
  message,
  status,
  pagination,
}: ApiSuccessOptions<T>) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    },
    { status }
  );
}

/**
 * A collection of common, pre-configured API success response helpers.
 * These functions simplify the creation of standard success responses with correct status codes and messages.
 */
export const Successes = {
  /**
   * Creates a 200 OK response with a data payload.
   * @template T The type of the data.
   * @param {T} data The data to include in the response.
   * @returns {NextResponse} A 200 OK response.
   */
  Ok: <T>(data: T) =>
    apiSuccess({
      data,
      message: "Request successful",
      status: 200,
    }),

  /**
   * Creates a 201 Created response for a new resource.
   * @template T The type of the data.
   * @param {T} data The data for the newly created resource.
   * @returns {NextResponse} A 201 Created response.
   */
  Created: <T>(data: T) =>
    apiSuccess({
      data,
      message: "Resource created successfully",
      status: 201,
    }),

  /**
   * Creates a 204 No Content response, typically for a successful deletion or update.
   * @returns {NextResponse} A 204 No Content response.
   */
  NoContent: () =>
    new NextResponse(null, { status: 204 }),

  /**
   * Creates a 202 Accepted response, for a request that has been accepted for processing.
   * @template T The type of the data.
   * @param {T} data The data to include in the response.
   * @returns {NextResponse} A 202 Accepted response.
   */
  Accepted: <T>(data: T) =>
    apiSuccess({
      data,
      message: "Request accepted for processing",
      status: 202,
    }),
};
