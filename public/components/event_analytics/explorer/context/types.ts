/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CoreStart } from '../../../../../../../src/core/public';
import { OpenSearchDashboardsReactNotifications } from '../../../../../../../src/plugins/opensearch_dashboards_react/public';
import PPLService from '../../../../services/requests/ppl';
import DSLService from '../../../../services/requests/dsl';
import { QueryManager } from '../../../../../common/query_manager';

export type OpenSearchDashboardsServices = Partial<CoreStart>;
export type DashboardsObservabilityServices = OpenSearchDashboardsServices & {
  pplService: PPLService;
  dslService: DSLService;
  queryManager: QueryManager;
};

export interface ObservabilityDashboardsReactContextValue<
  Services extends OpenSearchDashboardsServices
> {
  readonly services: Services;
  readonly notifications: OpenSearchDashboardsReactNotifications;
}

export interface DashboardsObservabilityContext<T extends OpenSearchDashboardsServices> {
  value: ObservabilityDashboardsReactContextValue<T>;
  Provider: React.FC<{ services?: T; children: React.ReactDOM }>;
  Consumer: React.Consumer<ObservabilityDashboardsReactContextValue<T>>;
}
