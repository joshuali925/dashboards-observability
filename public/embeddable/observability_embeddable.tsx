/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Subscription } from 'rxjs';
import { AttributeService } from '../../../../src/plugins/dashboard/public';
import {
  Embeddable,
  EmbeddableOutput,
  IContainer,
  ReferenceOrValueEmbeddable,
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

export type ObservabilityByValueInput = {
  attributes: ObservabilitySavedObjectAttributes;
} & SavedObjectEmbeddableInput;

export interface ObservabilityOutput extends EmbeddableOutput {
  /**
   * Will contain the saved object attributes of the Observability Saved Object that matches
   * `input.savedObjectId`. If the id is invalid, this may be undefined.
   */
  attributes?: ObservabilitySavedObjectAttributes;
}

export class ObservabilityEmbeddable
  extends Embeddable<SavedObjectEmbeddableInput, ObservabilityOutput>
  implements ReferenceOrValueEmbeddable<SavedObjectEmbeddableInput, SavedObjectEmbeddableInput>
{
  public readonly type = OBSERVABILITY_EMBEDDABLE;
  private subscription: Subscription;
  private node?: HTMLElement;
  private savedObjectId?: string;
  private attributes?: ObservabilitySavedObjectAttributes;

  constructor(
    initialInput: SavedObjectEmbeddableInput,
    private attributeService: AttributeService<ObservabilitySavedObjectAttributes>,
    {
      parent,
    }: {
      parent?: IContainer;
    }
  ) {
    super(initialInput, {} as ObservabilityOutput, parent);

    this.subscription = this.getInput$().subscribe(async () => {
      const savedObjectId = this.getInput().savedObjectId;
      const attributes = (this.getInput() as ObservabilityByValueInput).attributes;
      if (this.attributes !== attributes || this.savedObjectId !== savedObjectId) {
        this.savedObjectId = savedObjectId;
        this.reload();
      } else {
        this.updateOutput({
          attributes: this.attributes,
          title: this.attributes.title,
        });
      }
    });
  }

  readonly inputIsRefType = (
    input: SavedObjectEmbeddableInput
  ): input is SavedObjectEmbeddableInput => {
    return this.attributeService.inputIsRefType(input);
  };

  readonly getInputAsValueType = async (): Promise<SavedObjectEmbeddableInput> => {
    const input = this.attributeService.getExplicitInputFromEmbeddable(this);
    console.log('❗input as value type:', input);
    return this.attributeService.getInputAsValueType(input);
  };

  readonly getInputAsRefType = async (): Promise<SavedObjectEmbeddableInput> => {
    const input = this.attributeService.getExplicitInputFromEmbeddable(this);
    console.log('❗input as ref type:', input);
    return this.attributeService.getInputAsRefType(input, {
      showSaveModal: true,
      saveModalTitle: this.getTitle(),
    });
  };

  public render(node: HTMLElement) {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
    this.node = node;
    ReactDOM.render(<ObservabilityEmbeddableComponent embeddable={this} />, node);
  }

  public async reload() {
    this.attributes = await this.attributeService.unwrapAttributes(this.input);
    console.log('❗reload attributes:', this.attributes);

    this.updateOutput({
      attributes: this.attributes,
      title: this.attributes.title,
    });
  }
}
