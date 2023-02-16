import { OverlayStart, SavedObjectsClientContract } from '../../../../src/core/public';
import { DashboardStart } from '../../../../src/plugins/dashboard/public';
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  EmbeddableFactoryDefinition,
  EmbeddableOutput,
  IContainer,
  SavedObjectEmbeddableInput,
} from '../../../../src/plugins/embeddable/public';
import {
  ObservabilitySavedObjectAttributes,
  OBSERVABILITY_SAVED_OBJECT,
} from '../../common/types/observability_saved_object_attributes';
import {
  ObservabilityEmbeddable,
  ObservabilityOutput,
  OBSERVABILITY_EMBEDDABLE,
} from './observability_embeddable';

interface StartServices {
  getAttributeService: DashboardStart['getAttributeService'];
  openModal: OverlayStart['openModal'];
  savedObjectsClient: SavedObjectsClientContract;
  overlays: OverlayStart;
}

export class ObservabilityEmbeddableFactoryDefinition
  implements
    EmbeddableFactoryDefinition<
      SavedObjectEmbeddableInput,
      ObservabilityOutput | EmbeddableOutput,
      ObservabilityEmbeddable,
      ObservabilitySavedObjectAttributes
    >
{
  public readonly type = OBSERVABILITY_EMBEDDABLE;
  public readonly savedObjectMetaData = {
    name: 'Observability',
    includeFields: ['visualizationState'],
    type: OBSERVABILITY_SAVED_OBJECT,
    getIconForSavedObject: () => 'pencil',
  };

  constructor(private getStartServices: () => Promise<StartServices>) {}

  async createFromSavedObject(
    savedObjectId: string,
    input: SavedObjectEmbeddableInput,
    parent?: IContainer
  ) {
    console.log('❗savedObjectId:', savedObjectId);
    console.log('❗saved object input:', input);
    return this.create(input, parent);
  }

  async create(initialInput: SavedObjectEmbeddableInput, parent?: IContainer) {
    return new ObservabilityEmbeddable(initialInput, { parent });
  }

  async isEditable() {
    // TODO: Add proper access controls
    // return getCapabilities().visualize.save as boolean;
    return true;
  }

  getDisplayName() {
    return 'Observability';
  }
}
