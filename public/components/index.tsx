/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { QueryManager } from 'common/query_manager';
import { AppMountParameters, CoreStart } from '../../../../src/core/public';
import { AppPluginStartDependencies, SetupDependencies } from '../types';
import { App } from './app';
import { DashboardsObservabilityContextProvider } from './event_analytics/explorer/context/context';

export const Observability = (
  CoreStartProp: CoreStart,
  DepsStart: AppPluginStartDependencies,
  AppMountParametersProp: AppMountParameters,
  pplService: any,
  dslService: any,
  savedObjects: any,
  timestampUtils: any,
  queryManager: QueryManager,
  startPage: string,
  dataSourcePluggables
) => {

  ReactDOM.render(
    <DashboardsObservabilityContextProvider services={{
      ...CoreStartProp,
      ...DepsStart,
      pplService,
      dslService,
      queryManager,
      savedObjects,
      timestampUtils,
      dataSourcePluggables,
    }}>
      <App
        CoreStartProp={CoreStartProp}
        DepsStart={DepsStart}
        pplService={pplService}
        dslService={dslService}
        savedObjects={savedObjects}
        timestampUtils={timestampUtils}
        queryManager={queryManager}
        startPage={startPage}
        dataSourcePluggables={dataSourcePluggables}
      />
    </DashboardsObservabilityContextProvider>,
    AppMountParametersProp.element
  );

  return () => ReactDOM.unmountComponentAtNode(AppMountParametersProp.element);
};
