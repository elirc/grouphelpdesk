// Author: Morgan Lee
// Issue: #10 â€” Provide lightweight request validation helpers

import { ValidationError } from '../utils/errors';

export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }

  return value.trim();
}

export function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  return value.trim();
}

export function stringArray(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ValidationError(`${fieldName} must be an array of strings.`);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}
