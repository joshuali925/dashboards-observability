/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectAttributes } from '../../../../src/core/types';
import { SavedVisualization } from './explorer';

export const OBSERVABILITY_SAVED_OBJECT = 'observability';

export interface ObservabilitySavedObjectAttributes extends SavedObjectAttributes {
  title: string;
  description?: string;
  version: number;
  savedVisualization?: SavedVisualization;
  /* visualizationState?: string;
  updated_at?: string;
  styleState?: string;
  searchSourceFields?: {
    index?: string;
  }; */
}
