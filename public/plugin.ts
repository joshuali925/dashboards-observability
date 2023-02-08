/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
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
import { uiSettingsService } from '../common/utils';
import { convertLegacyNotebooksUrl } from './components/notebooks/components/helpers/legacy_route_helpers';
import { convertLegacyTraceAnalyticsUrl } from './components/trace_analytics/components/common/legacy_route_helpers';
import { Traces } from './core_visualize/traces';
import './index.scss';
import DSLService from './services/requests/dsl';
import PPLService from './services/requests/ppl';
import SavedObjects from './services/saved_objects/event_analytics/saved_objects';
import TimestampUtils from './services/timestamp/timestamp';
import { AppPluginStartDependencies, ObservabilitySetup, ObservabilityStart } from './types';

export interface SetupDependencies {
  visualizations: VisualizationsSetup;
}

export class ObservabilityPlugin implements Plugin<ObservabilitySetup, ObservabilityStart> {
  public setup(core: CoreSetup, setupDeps: SetupDependencies): ObservabilitySetup {
    uiSettingsService.init(core.uiSettings, core.notifications);

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
        const pplService = new PPLService(coreStart.http);
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
    const dependencies = {
      uiSettings: core.uiSettings,
      http: core.http,
    };
    this.getDefinitions().forEach((definition) => {
      setupDeps.visualizations.createReactVisualization(definition);
    });

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
    return {};
  }
  public stop() {}
}
