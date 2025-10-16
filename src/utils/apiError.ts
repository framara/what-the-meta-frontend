/**
 * ApiError: Consistent error wrapper for API failures
 * 
 * Normalizes axios errors and network errors into a consistent format
 * with useful properties for error handling in components.
 */

import axios from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly originalError?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.originalError = originalError;
    
    // Set prototype explicitly for instanceof checks to work correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create an ApiError from an axios error or generic error
   * @param error The error to normalize
   * @returns ApiError instance
   */
  static fromAxiosError(error: unknown): ApiError {
    // Check if it's an abort error first (can be wrapped in axios error)
    if (error instanceof Error) {
      if (error.name === 'AbortError' || (error as any).code === 'ERR_CANCELED') {
        return new ApiError(
          'Request was cancelled',
          undefined,
          'REQUEST_ABORTED',
          error
        );
      }
    }

    if (axios.isAxiosError(error)) {
      // Check for abort in axios error
      if (error.code === 'ERR_CANCELED' || (error as any).cause?.name === 'AbortError') {
        return new ApiError(
          'Request was cancelled',
          undefined,
          'REQUEST_ABORTED',
          error
        );
      }

      // HTTP error response
      if (error.response) {
        return new ApiError(
          error.response.data?.message || error.message || 'HTTP Error',
          error.response.status,
          error.code || `HTTP_${error.response.status}`,
          error
        );
      }
      // Network error (no response from server)
      if (error.request) {
        return new ApiError(
          error.message || 'Network error - no response from server',
          undefined,
          'NETWORK_NO_RESPONSE',
          error
        );
      }
      // Request setup error
      return new ApiError(
        error.message || 'Request setup failed',
        undefined,
        'REQUEST_SETUP_ERROR',
        error
      );
    }

    // Handle abort errors specially
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new ApiError(
          'Request was cancelled',
          undefined,
          'REQUEST_ABORTED',
          error
        );
      }
      
      return new ApiError(
        error.message || 'An error occurred',
        undefined,
        'UNKNOWN_ERROR',
        error
      );
    }

    // Fallback for unknown errors
    return new ApiError(
      'An unexpected error occurred',
      undefined,
      'UNKNOWN_ERROR',
      error
    );
  }

  /**
   * Determine if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  /**
   * Determine if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  /**
   * Determine if this is a network error
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_NO_RESPONSE' || this.code === 'ECONNABORTED';
  }

  /**
   * Determine if this is an abort/cancellation error
   */
  isAbortError(): boolean {
    return this.code === 'REQUEST_ABORTED';
  }

  /**
   * Determine if this is a rate limit error (429)
   */
  isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Determine if this is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Determine if this is an unauthorized error (401)
   */
  isUnauthorizedError(): boolean {
    return this.status === 401;
  }

  /**
   * Determine if this is a forbidden error (403)
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    if (this.isAbortError()) {
      return 'Request was cancelled';
    }

    if (this.isNetworkError()) {
      return 'Network error - please check your connection';
    }

    if (this.isRateLimitError()) {
      return 'Too many requests - please try again later';
    }

    if (this.isNotFoundError()) {
      return 'The requested data was not found';
    }

    if (this.isUnauthorizedError()) {
      return 'You are not authorized to access this resource';
    }

    if (this.isForbiddenError()) {
      return 'You do not have permission to access this resource';
    }

    if (this.isServerError()) {
      return 'Server error - please try again later';
    }

    return this.message;
  }
}
