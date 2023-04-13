/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nProvider } from '@osd/i18n/react';
import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { observabilityID, observabilityTitle } from '../../common/constants/shared';
import { ObservabilityAppDeps } from './app';
import { Home as ApplicationAnalyticsHome } from './application_analytics/home';
import { Home as CustomPanelsHome } from './custom_panels/home';
import { EventAnalytics } from './event_analytics';
import { Home as MetricsHome } from './metrics';
import { Main as NotebooksHome } from './notebooks/components/main';
import { Home as TraceAnalyticsHome } from './trace_analytics/home';

export const AppRoutesWrapper = ({
  coreStart,
  depsStart,
  pplService,
  dslService,
  savedObjects,
  timestampUtils,
  queryManager,
  startPage,
}: ObservabilityAppDeps) => {
  const { chrome, http, notifications } = coreStart;
  const parentBreadcrumb = {
    text: observabilityTitle,
    href: `${observabilityID}#/`,
  };

  const customPanelBreadcrumb = {
    text: 'Dashboards',
    href: '#/operational_panels/',
  };

  const MetricsBreadcrumb = {
    text: 'Metrics',
    href: '#/metrics_analytics/',
  };

  const history = useHistory();
  useEffect(() => {
    console.log('❗startPage:', startPage);
    // if (startPage && history) {
    //   history.replace(startPage!);
    // }
  }, []);

  const route = () => {
    switch (startPage) {
      case '/notebooks':
        console.log('❗notebooks');
        return (
          <I18nProvider>
            <>
              <Switch>
                <Route
                  path="/"
                  render={(props) => (
                    <NotebooksHome
                      {...props}
                      DashboardContainerByValueRenderer={
                        depsStart.dashboard.DashboardContainerByValueRenderer
                      }
                      http={http}
                      pplService={pplService}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      parentBreadcrumb={parentBreadcrumb}
                      notifications={notifications}
                    />
                  )}
                />
              </Switch>
            </>
          </I18nProvider>
        );

      default:
        return (
          <I18nProvider>
            <>
              <Switch>
                <Route
                  path={'/application_analytics'}
                  render={(props) => {
                    return (
                      <ApplicationAnalyticsHome
                        {...props}
                        chrome={chrome}
                        http={http}
                        notifications={notifications}
                        parentBreadcrumbs={[parentBreadcrumb]}
                        pplService={pplService}
                        dslService={dslService}
                        savedObjects={savedObjects}
                        timestampUtils={timestampUtils}
                      />
                    );
                  }}
                />
                <Route
                  path="/notebooks"
                  render={(props) => (
                    <NotebooksHome
                      {...props}
                      DashboardContainerByValueRenderer={
                        depsStart.dashboard.DashboardContainerByValueRenderer
                      }
                      http={http}
                      pplService={pplService}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      parentBreadcrumb={parentBreadcrumb}
                      notifications={notifications}
                    />
                  )}
                />
                <Route
                  path="/operational_panels"
                  render={(props) => {
                    chrome.setBreadcrumbs([parentBreadcrumb, customPanelBreadcrumb]);
                    return (
                      <CustomPanelsHome
                        http={http}
                        chrome={chrome}
                        parentBreadcrumbs={[parentBreadcrumb, customPanelBreadcrumb]}
                        pplService={pplService}
                        dslService={dslService}
                        renderProps={props}
                      />
                    );
                  }}
                />
                <Route
                  path="/metrics_analytics"
                  render={(props) => {
                    chrome.setBreadcrumbs([parentBreadcrumb, MetricsBreadcrumb]);
                    return (
                      <MetricsHome
                        http={http}
                        chrome={chrome}
                        parentBreadcrumb={parentBreadcrumb}
                        renderProps={props}
                        pplService={pplService}
                        savedObjects={savedObjects}
                      />
                    );
                  }}
                />
                <Route
                  path={['/trace_analytics', '/trace_analytics/home']}
                  render={(props) => (
                    <TraceAnalyticsHome
                      {...props}
                      chrome={chrome}
                      http={http}
                      parentBreadcrumbs={[parentBreadcrumb]}
                    />
                  )}
                />
                <Route
                  path={['/', '/event_analytics']}
                  render={(props) => {
                    return (
                      <EventAnalytics
                        chrome={chrome}
                        parentBreadcrumbs={[parentBreadcrumb]}
                        pplService={pplService}
                        dslService={dslService}
                        savedObjects={savedObjects}
                        timestampUtils={timestampUtils}
                        http={http}
                        notifications={notifications}
                        queryManager={queryManager}
                        {...props}
                      />
                    );
                  }}
                />
              </Switch>
            </>
          </I18nProvider>
        );
        break;
    }
  };
  return route();
};
