// src/types/utils.ts

/**
 * Makes all properties in T optional, recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[] // Handle arrays
    : T[P] extends object
    ? DeepPartial<T[P]> // Handle nested objects
    : T[P]; // Keep primitive types as they are (optional)
};
