export type FieldErrors = Record<string, string>;

export type ActiveError = { id: string; message: string; fields: string[] } | null;

