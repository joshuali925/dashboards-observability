/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsClient } from '../../../src/core/server';
import { DashboardStart } from '../../../src/plugins/dashboard/public';
import { DataPublicPluginSetup, DataPublicPluginStart } from '../../../src/plugins/data/public';
import { EmbeddableSetup, EmbeddableStart } from '../../../src/plugins/embeddable/public';
import { ManagementOverViewPluginSetup } from '../../../src/plugins/management_overview/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { UiActionsStart } from '../../../src/plugins/ui_actions/public';
import { VisualizationsSetup } from '../../../src/plugins/visualizations/public';
import { AssistantSetup } from './types';

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  embeddable: EmbeddableStart;
  dashboard: DashboardStart;
  savedObjectsClient: SavedObjectsClient;
  data: DataPublicPluginStart;
}

export interface SetupDependencies {
  embeddable: EmbeddableSetup;
  visualizations: VisualizationsSetup;
  data: DataPublicPluginSetup;
  uiActions: UiActionsStart;
  managementOverview?: ManagementOverViewPluginSetup;
  assistantDashboards?: AssistantSetup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservabilitySetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservabilityStart {}

/**
 * Introduce a compile dependency on dashboards-assistant
 * as observerability need some types from the plugin.
 * It will gives an type error when dashboards-assistant is not installed so add a ts-ignore to suppress the error.
 */
// @ts-ignore
export type { AssistantSetup, RenderProps, IMessage } from '../../dashboards-assistant/public';
