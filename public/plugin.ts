/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { ReactVisTypeOptions } from '../../../src/plugins/visualizations/public';
import {
  observabilityID,
  observabilityPluginOrder,
  observabilityTitle,
} from '../common/constants/shared';
import { QueryManager } from '../common/query_manager';
import { VISUALIZATION_SAVED_OBJECT } from '../common/types/observability_saved_object_attributes';
import { setPPLService, setSavedObjectsClient, uiSettingsService } from '../common/utils';
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
import {
  AppPluginStartDependencies,
  ObservabilitySetup,
  ObservabilityStart,
  SetupDependencies,
} from './types';

export class ObservabilityPlugin
  implements
    Plugin<ObservabilitySetup, ObservabilityStart, SetupDependencies, AppPluginStartDependencies>
{
  public setup(
    core: CoreSetup<AppPluginStartDependencies>,
    setupDeps: SetupDependencies
  ): ObservabilitySetup {
    uiSettingsService.init(core.uiSettings, core.notifications);
    const pplService = new PPLService(core.http);
    const qm = new QueryManager();
    setPPLService(pplService);
    core.getStartServices().then(([coreStart]) => {
      setSavedObjectsClient(coreStart.savedObjects.client);
    });

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
        const savedObjects = new SavedObjects(coreStart.http, coreStart.savedObjects.client);
        const timestampUtils = new TimestampUtils(dslService, pplService);
        /* const client = new OSDSavedVisualizationClient(coreStart.savedObjects.client);
        const response = await client.create({
          query: 'source = opensearch_dashboards_sample_data_flights | stats count() by Carrier ',
          fields: [],
          dateRange: ['now-15m', 'now'],
          name: 'aa',
          timestamp: 'timestamp',
          type: 'bar',
          applicationId: '',
          description: '',
          subType: 'visualization',
          selectedPanels: [],
        });
        const getR = await client.get({ objectId: '0b9162a0-cdb7-11ed-9dc9-d3aa8980826d' });
        console.log('❗getR:', getR);
        const updateResponse = await client.update({
          objectId: '0b9162a0-cdb7-11ed-9dc9-d3aa8980826d',
          query: 'source = opensearch_dashboards_sample_data_flights | stats count() by Carrier ',
          fields: [],
          dateRange: ['now-15m', 'now'],
          name: 'aa2',
          timestamp: 'timestamp',
          type: 'bar',
          userConfigs:
            '{"dataConfig":{"series":[{"label":"","name":"","aggregation":"count","customLabel":""}],"dimensions":[{"label":"Carrier","name":"Carrier","customLabel":""}]}}',
          description: '',
          subType: 'visualization',
        });
        console.log('❗updateResponse:', updateResponse);
        const getR2 = await client.get({ objectId: '0b9162a0-cdb7-11ed-9dc9-d3aa8980826d' });
        console.log('❗getR2:', getR2); */
        return Observability(
          coreStart,
          depsStart,
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
      savedObjectsClient: (await core.getStartServices())[0].savedObjects.client,
      overlays: (await core.getStartServices())[0].overlays,
    }));
    setupDeps.embeddable.registerEmbeddableFactory(OBSERVABILITY_EMBEDDABLE, embeddableFactory);

    setupDeps.visualizations.registerAlias({
      name: observabilityID,
      title: observabilityTitle,
      description: 'create a visualization with Piped processigng language',
      icon: 'pencil',
      aliasApp: observabilityID,
      aliasPath: '#/event_analytics/explorer',
      stage: 'production',
      appExtensions: {
        visualizations: {
          docTypes: [VISUALIZATION_SAVED_OBJECT],
          toListItem: ({ id, attributes, updated_at: updatedAt }) => ({
            description: attributes?.description,
            editApp: observabilityID,
            editUrl: `#/event_analytics/explorer/${encodeURIComponent(id)}`,
            icon: 'pencil',
            id,
            savedObjectType: VISUALIZATION_SAVED_OBJECT,
            title: attributes?.title,
            typeTitle: observabilityTitle,
            stage: 'production',
            updated_at: updatedAt,
          }),
        },
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public getDefinitions(): Array<ReactVisTypeOptions<unknown>> {
    return [
      {
        name: 'observability_traces',
        title: 'Federated',
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
        title: 'PromQL',
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
        title: 'PPL',
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
      {
        name: 'observability_visualizations',
        title: 'SQL',
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
    /* core.savedObjects.client.create<VisualizationSavedObjectAttributes>(
      VISUALIZATION_SAVED_OBJECT,
      {
        title: '[Logs] Daily count for error response codes',
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
    ); */
    return {};
  }
  public stop() {}
}
