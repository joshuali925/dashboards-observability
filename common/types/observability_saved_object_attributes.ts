/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectAttributes } from '../../../../src/core/types';
import { SavedVisualization } from './explorer';

export const VISUALIZATION_SAVED_OBJECT = 'observability-visualization';

export interface VisualizationSavedObjectAttributes extends SavedObjectAttributes {
  title: string;
  description?: string;
  version: number;
  savedVisualization?: SavedVisualization;
}
