/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OverlayStart } from '../../../../src/core/public';
import { SavedObjectsClientContract } from '../../../../src/core/target/types/public/saved_objects';
import { DashboardStart } from '../../../../src/plugins/dashboard/public';
import { ViewMode } from '../../../../src/plugins/embeddable/public';
import { createAction } from '../../../../src/plugins/ui_actions/public';
import { observabilityID } from '../../common/constants/shared';
import { ObservabilityEmbeddable, OBSERVABILITY_EMBEDDABLE } from './observability_embeddable';

interface StartServices {
  getAttributeService: DashboardStart['getAttributeService'];
  openModal: OverlayStart['openModal'];
  savedObjectsClient: SavedObjectsClientContract;
  overlays: OverlayStart;
}

interface ActionContext {
  embeddable: ObservabilityEmbeddable;
}

export const createEditObservabilityVisualizationAction = () =>
  createAction({
    getDisplayName: () => 'Edit',
    type: '',
    order: 100,
    getIconType: () => 'pencil',
    isCompatible: async ({ embeddable }: ActionContext) => {
      return (
        embeddable.type === OBSERVABILITY_EMBEDDABLE &&
        embeddable.getInput().viewMode === ViewMode.EDIT
      );
    },
    execute: async ({ embeddable }: ActionContext) => {
      window.location.assign(`/app/${observabilityID}#/event_analytics/explorer/${embeddable.id}`);
    },
  });
