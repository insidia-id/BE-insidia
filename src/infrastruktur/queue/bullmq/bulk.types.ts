export type UploadedBulkFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};
export type ValidationResult<T extends Record<string, unknown>> = {
  rowNumber: number;
  rawData: T;
  parsedData?: T;
  errors: string[];
  warnings?: string[];
};
