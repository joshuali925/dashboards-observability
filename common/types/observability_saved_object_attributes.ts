/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectAttributes } from '../../../../src/core/types';

export const OBSERVABILITY_SAVED_OBJECT = 'observability';

export interface ObservabilitySavedObjectAttributes extends SavedObjectAttributes {
  title: string;
  description?: string;
  visualizationState?: string;
  updated_at?: string;
  styleState?: string;
  version: number;
  searchSourceFields?: {
    index?: string;
  };
}
