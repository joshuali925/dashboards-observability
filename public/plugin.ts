/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
  SavedObjectsClient,
} from '../../../src/core/public';
import { DashboardStart } from '../../../src/plugins/dashboard/public';
import { DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { EmbeddableSetup, EmbeddableStart } from '../../../src/plugins/embeddable/public';
import { UiActionsStart } from '../../../src/plugins/ui_actions/public';
import {
  ReactVisTypeOptions,
  VisualizationsSetup,
} from '../../../src/plugins/visualizations/public';
import {
  observabilityID,
  observabilityPluginOrder,
  observabilityTitle,
} from '../common/constants/shared';
import { QueryManager } from '../common/query_manager';
import {
  ObservabilitySavedObjectAttributes,
  OBSERVABILITY_SAVED_OBJECT,
} from '../common/types/observability_saved_object_attributes';
import { uiSettingsService } from '../common/utils';
import { setPPLService } from '../common/utils/settings_service';
import { convertLegacyNotebooksUrl } from './components/notebooks/components/helpers/legacy_route_helpers';
import { convertLegacyTraceAnalyticsUrl } from './components/trace_analytics/components/common/legacy_route_helpers';
import { Traces } from './core_visualize/traces';
import { OBSERVABILITY_EMBEDDABLE } from './embeddable/observability_embeddable';
import { ObservabilityEmbeddableFactoryDefinition } from './embeddable/observability_embeddable_factory';
import './index.scss';
import DSLService from './services/requests/dsl';
import PPLService from './services/requests/ppl';
import SavedObjects from './services/saved_objects/event_analytics/saved_objects';
import TimestampUtils from './services/timestamp/timestamp';
import { AppPluginStartDependencies, ObservabilitySetup, ObservabilityStart } from './types';

export interface SetupDependencies {
  embeddable: EmbeddableSetup;
  visualizations: VisualizationsSetup;
  data: DataPublicPluginSetup;
  uiActions: UiActionsStart;
}

export interface StartDependencies {
  embeddable: EmbeddableStart;
  dashboard: DashboardStart;
  savedObjectsClient: SavedObjectsClient;
}

export class ObservabilityPlugin
  implements Plugin<ObservabilitySetup, ObservabilityStart, SetupDependencies, StartDependencies>
{
  public setup(
    core: CoreSetup<StartDependencies>,
    setupDeps: SetupDependencies
  ): ObservabilitySetup {
    uiSettingsService.init(core.uiSettings, core.notifications);
    const pplService = new PPLService(core.http);
    setPPLService(pplService);

    // redirect legacy notebooks URL to current URL under observability
    if (window.location.pathname.includes('notebooks-dashboards')) {
      window.location.assign(convertLegacyNotebooksUrl(window.location));
    }

    // redirect legacy trace analytics URL to current URL under observability
    if (window.location.pathname.includes('trace-analytics-dashboards')) {
      window.location.assign(convertLegacyTraceAnalyticsUrl(window.location));
    }

    core.application.register({
      id: observabilityID,
      title: observabilityTitle,
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      order: observabilityPluginOrder,
      async mount(params: AppMountParameters) {
        const { Observability } = await import('./components/index');
        const [coreStart, depsStart] = await core.getStartServices();
        const dslService = new DSLService(coreStart.http);
        const savedObjects = new SavedObjects(coreStart.http);
        const timestampUtils = new TimestampUtils(dslService, pplService);
        const qm = new QueryManager();
        return Observability(
          coreStart,
          depsStart as AppPluginStartDependencies,
          params,
          pplService,
          dslService,
          savedObjects,
          timestampUtils,
          qm
        );
      },
    });
    this.getDefinitions().forEach((definition) => {
      setupDeps.visualizations.createReactVisualization(definition);
    });

    const embeddableFactory = new ObservabilityEmbeddableFactoryDefinition(async () => ({
      getAttributeService: (await core.getStartServices())[1].dashboard.getAttributeService,
      openModal: (await core.getStartServices())[0].overlays.openModal,
      savedObjectsClient: (await core.getStartServices())[0].savedObjects.client,
      overlays: (await core.getStartServices())[0].overlays,
    }));
    setupDeps.embeddable.registerEmbeddableFactory(OBSERVABILITY_EMBEDDABLE, embeddableFactory);

    // Return methods that should be available to other plugins
    return {};
  }

  public getDefinitions(): Array<ReactVisTypeOptions<unknown>> {
    return [
      {
        name: 'observability_traces',
        title: 'Observability Traces',
        icon: 'apmTrace',
        description: 'This visualization allows you to create a Gantt chart.',
        visConfig: {
          component: Traces,
          defaults: {},
        },
        editorConfig: {
          optionTabs: [{ name: 'editor', title: 'Data', editor: Traces }],
        },
        options: {
          showIndexSelection: false,
          showQueryBar: false,
          showFilterBar: false,
        },
        requestHandler: () => [],
        responseHandler: (e: any) => e,
      },
      {
        name: 'observability_metrics',
        title: 'Observability Metrics',
        icon: 'stats',
        description: 'This visualization allows you to create a Gantt chart.',
        visConfig: {
          component: Traces,
          defaults: {},
        },
        editorConfig: {
          optionTabs: [{ name: 'editor', title: 'Data', editor: Traces }],
        },
        requestHandler: () => [],
        responseHandler: (e: any) => e,
      },
      {
        name: 'observability_applications',
        title: 'Observability Applications',
        icon: 'apps',
        description: 'This visualization allows you to create a Gantt chart.',
        visConfig: {
          component: Traces,
          defaults: {},
        },
        editorConfig: {
          optionTabs: [{ name: 'editor', title: 'Data', editor: Traces }],
        },
        requestHandler: () => [],
        responseHandler: (e: any) => e,
      },
      {
        name: 'observability_visualizations',
        title: 'Observability Visualizations',
        icon: 'lensApp',
        description: 'This visualization allows you to create a Gantt chart.',
        visConfig: {
          component: Traces,
          defaults: {},
        },
        editorConfig: {
          optionTabs: [{ name: 'editor', title: 'Data', editor: Traces }],
        },
        requestHandler: () => [],
        responseHandler: (e: any) => e,
      },
    ];
  }

  public start(core: CoreStart): ObservabilityStart {
    core.savedObjects.client.create<ObservabilitySavedObjectAttributes>(
      OBSERVABILITY_SAVED_OBJECT,
      {
        title: 'Test embeddable observability',
        description: 'custome desc',
        version: 1,
        savedVisualization: {
          name: '[Logs] Daily count for error response codes',
          description: '',
          query:
            "source = opensearch_dashboards_sample_data_logs | where response='503' or response='404' | stats count() by span(timestamp,1d)",
          type: 'bar',
          selected_date_range: {
            start: 'now/y',
            end: 'now',
            text: '',
          },
          selected_timestamp: {
            name: 'timestamp',
            type: 'timestamp',
          },
          selected_fields: {
            text: '',
            tokens: [],
          },
        },
      },
      {
        id: 'observability-sample-embeddable',
        overwrite: true,
      }
    );
    return {};
  }
  public stop() {}
}
