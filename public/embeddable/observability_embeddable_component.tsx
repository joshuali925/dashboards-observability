/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TimeRange } from '../../../../src/plugins/data/common';
import {
  SavedObjectEmbeddableInput,
  withEmbeddableSubscription,
} from '../../../../src/plugins/embeddable/public';
import { SavedVisualization } from '../../common/types/explorer';
import { SavedObjectVisualization } from '../components/visualizations/saved_object_visualization';
import { ObservabilityEmbeddable, ObservabilityOutput } from './observability_embeddable';

interface ObservabilityEmbeddableComponentProps {
  input: SavedObjectEmbeddableInput;
  output: ObservabilityOutput;
  embeddable: ObservabilityEmbeddable;
}

interface SavedObjectVisualizationProps {
  savedVisualization: SavedVisualization;
  timeRange?: TimeRange;
}

const ObservabilityEmbeddableComponentInner: React.FC<ObservabilityEmbeddableComponentProps> = (
  props
) => {
  const visualization = props.output.attributes?.savedVisualization;
  return visualization ? (
    <SavedObjectVisualization
      savedVisualization={visualization}
      timeRange={props.input.timeRange}
    />
  ) : null;
};

export const ObservabilityEmbeddableComponent = withEmbeddableSubscription<
  SavedObjectEmbeddableInput,
  ObservabilityOutput,
  ObservabilityEmbeddable,
  {}
>(ObservabilityEmbeddableComponentInner);
