import { OverlayStart, SavedObjectsClientContract, SimpleSavedObject } from '../../../../src/core/public';
import { AttributeService, DashboardStart } from '../../../../src/plugins/dashboard/public';
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
import { checkForDuplicateTitle, OnSaveProps } from '../../../../src/plugins/saved_objects/public';
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
    name: 'SQL/PPL Visualizations',
    includeFields: ['visualizationState'],
    type: OBSERVABILITY_SAVED_OBJECT,
    getIconForSavedObject: () => 'lensApp',
  };
  private attributeService?: AttributeService<ObservabilitySavedObjectAttributes>;

  constructor(private getStartServices: () => Promise<StartServices>) {}

  async createFromSavedObject(
    savedObjectId: string,
    input: SavedObjectEmbeddableInput,
    parent?: IContainer
  ) {
    return this.create(input, parent);
  }

  async create(initialInput: SavedObjectEmbeddableInput, parent?: IContainer) {
    return new ObservabilityEmbeddable(initialInput, await this.getAttributeService(),{ parent });
  }

  async isEditable() {
    return true;
  }

  getDisplayName() {
    return 'Observability';
  }

  private async saveMethod(attributes: ObservabilitySavedObjectAttributes, savedObjectId?: string) {
    const { savedObjectsClient } = await this.getStartServices();
    if (savedObjectId) {
      return savedObjectsClient.update(this.type, savedObjectId, attributes);
    }
    return savedObjectsClient.create(this.type, attributes);
  }

  private async unwrapMethod(savedObjectId: string): Promise<ObservabilitySavedObjectAttributes> {
    const { savedObjectsClient } = await this.getStartServices();
    const savedObject: SimpleSavedObject<ObservabilitySavedObjectAttributes> = await savedObjectsClient.get<
      ObservabilitySavedObjectAttributes
    >(this.type, savedObjectId);
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
      this.attributeService = (await this.getStartServices()).getAttributeService<
        ObservabilitySavedObjectAttributes
      >(this.type, {
        saveMethod: this.saveMethod.bind(this),
        unwrapMethod: this.unwrapMethod.bind(this),
        checkForDuplicateTitle: this.checkForDuplicateTitleMethod.bind(this),
      });
    }
    return this.attributeService!;
  }
}
