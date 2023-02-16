/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {
  Embeddable,
  EmbeddableOutput,
  IContainer,
  SavedObjectEmbeddableInput,
} from '../../../../src/plugins/embeddable/public';
import {
  ObservabilitySavedObjectAttributes,
  OBSERVABILITY_SAVED_OBJECT,
} from '../../common/types/observability_saved_object_attributes';
import { ObservabilityEmbeddableComponent } from './observability_embeddable_component';

// Apparently this needs to match the saved object type for the clone and replace panel actions to work
export const OBSERVABILITY_EMBEDDABLE = OBSERVABILITY_SAVED_OBJECT;

export interface ObservabilityEmbeddableConfiguration {
  savedVisBuilder: ObservabilitySavedObjectAttributes;
  // TODO: add indexPatterns as part of configuration
  // indexPatterns?: IIndexPattern[];
  editPath: string;
  editUrl: string;
  editable: boolean;
}

export interface ObservabilityOutput extends EmbeddableOutput {
  /**
   * Will contain the saved object attributes of the Observability Saved Object that matches
   * `input.savedObjectId`. If the id is invalid, this may be undefined.
   */
  savedObservability?: ObservabilitySavedObjectAttributes;
}

export class ObservabilityEmbeddable extends Embeddable<
  SavedObjectEmbeddableInput,
  ObservabilityOutput
> {
  public readonly type = OBSERVABILITY_EMBEDDABLE;
  private node?: HTMLElement;

  constructor(
    initialInput: SavedObjectEmbeddableInput,
    // private attributeService: AttributeService,
    {
      parent,
    }: {
      parent?: IContainer;
    }
  ) {
    super(initialInput, {} as ObservabilityOutput, parent);
  }

  public render(node: HTMLElement) {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
    this.node = node;
    ReactDOM.render(<ObservabilityEmbeddableComponent embeddable={this} />, node);
  }

  public reload() {
    console.log('reload');
  }
}
