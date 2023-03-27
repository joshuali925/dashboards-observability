/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OverlayStart,
  SavedObjectsClientContract,
  SimpleSavedObject,
} from '../../../../src/core/public';
import { AttributeService, DashboardStart } from '../../../../src/plugins/dashboard/public';
import {
  EmbeddableFactoryDefinition,
  EmbeddableOutput,
  ErrorEmbeddable,
  IContainer,
  SavedObjectEmbeddableInput,
} from '../../../../src/plugins/embeddable/public';
import {
  checkForDuplicateTitle,
  OnSaveProps,
  SavedObjectMetaData,
} from '../../../../src/plugins/saved_objects/public';
import { observabilityID } from '../../common/constants/shared';
import {
  VisualizationSavedObjectAttributes,
  VISUALIZATION_SAVED_OBJECT,
} from '../../common/types/observability_saved_object_attributes';
import {
  ObservabilityEmbeddable,
  ObservabilityOutput,
  OBSERVABILITY_EMBEDDABLE,
} from './observability_embeddable';

interface StartServices {
  getAttributeService: DashboardStart['getAttributeService'];
  savedObjectsClient: SavedObjectsClientContract;
  overlays: OverlayStart;
}

export class ObservabilityEmbeddableFactoryDefinition
  implements
    EmbeddableFactoryDefinition<
      SavedObjectEmbeddableInput,
      ObservabilityOutput | EmbeddableOutput,
      ObservabilityEmbeddable,
      VisualizationSavedObjectAttributes
    >
{
  public readonly type = OBSERVABILITY_EMBEDDABLE;
  public readonly savedObjectMetaData: SavedObjectMetaData<VisualizationSavedObjectAttributes> = {
    name: 'SQL/PPL Visualizations',
    includeFields: [],
    type: VISUALIZATION_SAVED_OBJECT, // saved object type for finding embeddables in Dashboard
    getIconForSavedObject: () => 'lensApp',
  };
  private attributeService?: AttributeService<VisualizationSavedObjectAttributes>;

  constructor(private getStartServices: () => Promise<StartServices>) {}

  async createFromSavedObject(
    savedObjectId: string,
    input: SavedObjectEmbeddableInput,
    parent?: IContainer
  ) {
    const editPath = `#/event_analytics/explorer/${savedObjectId}`;
    const editUrl = `/app/${observabilityID}${editPath}`;
    return new ObservabilityEmbeddable(
      {
        editUrl,
        editPath,
        editApp: observabilityID,
      },
      input,
      await this.getAttributeService(),
      { parent }
    );
  }

  async create(initialInput: SavedObjectEmbeddableInput, parent?: IContainer) {
    return new ErrorEmbeddable(
      'Saved searches can only be created from a saved object',
      initialInput
    );
  }

  async isEditable() {
    return true;
  }

  getDisplayName() {
    return 'Observability';
  }

  private async saveMethod(attributes: VisualizationSavedObjectAttributes, savedObjectId?: string) {
    const { savedObjectsClient } = await this.getStartServices();
    if (savedObjectId) {
      return savedObjectsClient.update(this.type, savedObjectId, attributes);
    }
    return savedObjectsClient.create(this.type, attributes);
  }

  private async unwrapMethod(savedObjectId: string): Promise<VisualizationSavedObjectAttributes> {
    const { savedObjectsClient } = await this.getStartServices();
    const savedObject: SimpleSavedObject<VisualizationSavedObjectAttributes> =
      await savedObjectsClient.get<VisualizationSavedObjectAttributes>(this.type, savedObjectId);
    return { ...savedObject.attributes };
  }

  private async checkForDuplicateTitleMethod(props: OnSaveProps): Promise<true> {
    const start = await this.getStartServices();
    const { savedObjectsClient, overlays } = start;
    return checkForDuplicateTitle(
      {
        title: props.newTitle,
        copyOnSave: false,
        lastSavedTitle: '',
        getOpenSearchType: () => this.type,
        getDisplayName: this.getDisplayName || (() => this.type),
      },
      props.isTitleDuplicateConfirmed,
      props.onTitleDuplicate,
      {
        savedObjectsClient,
        overlays,
      }
    );
  }

  private async getAttributeService() {
    if (!this.attributeService) {
      this.attributeService = (
        await this.getStartServices()
      ).getAttributeService<VisualizationSavedObjectAttributes>(this.type, {
        saveMethod: this.saveMethod.bind(this),
        unwrapMethod: this.unwrapMethod.bind(this),
        checkForDuplicateTitle: this.checkForDuplicateTitleMethod.bind(this),
      });
    }
    return this.attributeService!;
  }
}
