import { z } from 'zod';

export const DataCollectionStrategySchema = z.object({
  data_collection_strategy: z.enum(['anonymized', 'non-anonymized', 'non-anonymized-by-consent']).describe('Data Collection Strategy').default('anonymized')
});

export type DataCollectionStrategy = z.infer<typeof DataCollectionStrategySchema>;