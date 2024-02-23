/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext, createContext, createElement } from 'react';
import { createNotifications } from '../../../../../../../src/plugins/opensearch_dashboards_react/public';
import {
  DashboardsObservabilityContext,
  OpenSearchDashboardsServices,
  ObservabilityDashboardsReactContextValue,
  DashboardsObservabilityServices,
} from './types';
import { useMemo } from 'react';
import React from 'react';

const defaultObservabilityContextValue = {
  services: {} as DashboardsObservabilityServices,
  notifications: createNotifications({}),
};

export const observabilityContext = createContext<
  ObservabilityDashboardsReactContextValue<DashboardsObservabilityServices>
>(defaultObservabilityContextValue);

export const useDashboardsObservability = (): ObservabilityDashboardsReactContextValue<
  DashboardsObservabilityServices
> => useContext(observabilityContext);

export const createDashboardsObservabilityContext = <Services extends OpenSearchDashboardsServices>(
  services: Services
): DashboardsObservabilityContext<Services> => {
  // common context
  const value = {
    services,
    notifications: createNotifications(services),
  };

  const Provider: React.FC<{ services?: Services; children: React.ReactDOM }> = ({
    services: additionalServices = {},
    children,
  }) => {
    const oldValue = useDashboardsObservability();
    const { value: mergedValue } = useMemo(
      () =>
        createDashboardsObservabilityContext({
          ...services,
          ...oldValue.services,
          ...additionalServices,
        }),
      [services, oldValue, additionalServices]
    );
    return createElement(observabilityContext.Provider as React.ComponentType<any>, {
      value: mergedValue,
      children,
    });
  };

  return {
    value,
    Provider,
    Consumer: (observabilityContext.Consumer as unknown) as React.Consumer<
      ObservabilityDashboardsReactContextValue<Services>
    >,
  };
};

export const {
  Provider: DashboardsObservabilityContextProvider,
} = createDashboardsObservabilityContext({});
