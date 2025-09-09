import type { DataTransformSchema } from './DataTransformSchema.js';
import type { Schema } from './Schema.js';

export type BrandConfig = {
  brand_id: string;
  brand_name: string;
  logo_url: string;
  is_mandatory: boolean;
  schema: Array<Schema>;
  dataTransform: DataTransformSchema;
};
