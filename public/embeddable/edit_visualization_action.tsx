/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApplicationStart } from '../../../../src/core/public';
import { ViewMode } from '../../../../src/plugins/embeddable/public';
import { createAction } from '../../../../src/plugins/ui_actions/public';
import { observabilityID } from '../../common/constants/shared';
import { ObservabilityEmbeddable, OBSERVABILITY_EMBEDDABLE } from './observability_embeddable';

interface ActionContext {
  embeddable: ObservabilityEmbeddable;
}

export const createEditObservabilityVisualizationAction = (
  navigateToUrl: ApplicationStart['navigateToUrl']
) =>
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
      navigateToUrl(`/app/${observabilityID}#/event_analytics/explorer/${embeddable.savedObjectId}`);
    },
  });
