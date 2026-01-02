import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

export interface ParsedApiError {
  message: string;
  statusCode: number;
  fieldErrors: Record<string, string[]> | null;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!error) {
    return {
      message: 'An unknown error occurred',
      statusCode: 500,
      fieldErrors: null,
    };
  }

  const axiosError = error as AxiosError<ApiResponse<unknown>>;

  if (axiosError.response?.data) {
    const apiResponse = axiosError.response.data;
    return {
      message: apiResponse.message || 'An error occurred',
      statusCode: axiosError.response.status,
      fieldErrors: apiResponse.errors || null,
    };
  }

  if (axiosError.message) {
    return {
      message: axiosError.message,
      statusCode: axiosError.response?.status || 500,
      fieldErrors: null,
    };
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    fieldErrors: null,
  };
}

export function getFieldErrorMessage(
  fieldErrors: Record<string, string[]> | null,
  fieldName: string
): string | null {
  if (!fieldErrors || !fieldErrors[fieldName]) {
    return null;
  }
  return fieldErrors[fieldName][0] || null;
}

export function getAllFieldErrors(
  fieldErrors: Record<string, string[]> | null
): string[] {
  if (!fieldErrors) {
    return [];
  }

  return Object.entries(fieldErrors).flatMap(([field, errors]) =>
    errors.map((error) => `${field}: ${error}`)
  );
}
