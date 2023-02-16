/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  SavedObjectEmbeddableInput,
  withEmbeddableSubscription,
} from '../../../../src/plugins/embeddable/public';
import { ObservabilityEmbeddable, ObservabilityOutput } from './observability_embeddable';

interface ObservabilityEmbeddableComponentProps {
  input: SavedObjectEmbeddableInput;
  output: ObservabilityOutput;
  embeddable: ObservabilityEmbeddable;
}

const ObservabilityEmbeddableComponentInner: React.FC<ObservabilityEmbeddableComponentProps> = (
  props
) => {
  return (
    <>
      <div>{JSON.stringify(props.output.attributes, null, 2)}</div>
      {/* <Visualization
        visualizations={}
      /> */}
    </>
  );
};

export const ObservabilityEmbeddableComponent = withEmbeddableSubscription<
  SavedObjectEmbeddableInput,
  ObservabilityOutput,
  ObservabilityEmbeddable,
  {}
>(ObservabilityEmbeddableComponentInner);
