/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EmbeddableFactory,
  EmbeddableFactoryDefinition,
  EmbeddableOutput,
  ErrorEmbeddable,
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

// TODO: use or remove?
export type ObservabilityEmbeddableFactory = EmbeddableFactory<
  SavedObjectEmbeddableInput,
  ObservabilityOutput | EmbeddableOutput,
  ObservabilityEmbeddable,
  ObservabilitySavedObjectAttributes
>;

export class ObservabilityEmbeddableFactoryDefinition
  implements
    EmbeddableFactoryDefinition<
      SavedObjectEmbeddableInput,
      ObservabilityOutput | EmbeddableOutput,
      ObservabilityEmbeddable,
      ObservabilitySavedObjectAttributes
    > {
  public readonly type = OBSERVABILITY_EMBEDDABLE;
  public readonly savedObjectMetaData = {
    // TODO: Update to include most vis functionality
    name: 'observability',
    includeFields: ['visualizationState'],
    type: OBSERVABILITY_SAVED_OBJECT,
    getIconForSavedObject: () => '',
  };

  // TODO: Would it be better to explicitly declare start service dependencies?
  constructor() {}

  public canCreateNew() {
    // Because Observability creation starts with the visualization modal, no need to have a separate entry for Observability until it's separate
    return false;
  }

  public async isEditable() {
    // TODO: Add proper access controls
    // return getCapabilities().visualize.save as boolean;
    return true;
  }

  public async createFromSavedObject(
    savedObjectId: string,
    input: Partial<SavedObjectEmbeddableInput> & { id: string },
    parent?: IContainer
  ): Promise<ObservabilityEmbeddable | ErrorEmbeddable> {
    try {
      // const savedVisBuilder = await getSavedVisBuilderLoader().get(savedObjectId);
      const editPath = `/edit/${savedObjectId}`;
      // const editUrl = getHttp().basePath.prepend(`/app/dashboards-observability{editPath}`);

      return new ObservabilityEmbeddable(
        // getTimeFilter(),
        undefined,
        {
          // savedVisBuilder,
          undefined,
          editUrl: '/',
          editPath,
          editable: true,
        },
        {
          ...input,
          savedObjectId: input.savedObjectId ?? '',
        },
        {
          parent,
        }
      );
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
      return new ErrorEmbeddable(e as Error, input, parent);
    }
  }

  public async create(_input: SavedObjectEmbeddableInput, _parent?: IContainer) {
    return undefined;
  }

  public getDisplayName() {
    return 'dashboards-observability';
  }
}
