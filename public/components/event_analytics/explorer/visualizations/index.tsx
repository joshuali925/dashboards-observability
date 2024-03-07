/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiResizableContainer } from '@elastic/eui';
import { QueryManager } from 'common/query_manager';
import React from 'react';
import { VIS_CHART_TYPES } from '../../../../../common/constants/shared';
import {
  ExplorerFields,
  IField,
  IQuery,
  IVisualizationContainerProps,
} from '../../../../../common/types/explorer';
import { ConfigPanel } from './config_panel';
import { DataConfigPanelItem } from './config_panel/config_panes/config_controls/data_configurations_panel';
import { LogsViewConfigPanelItem } from './config_panel/config_panes/config_controls/logs_view_config_panel_item';
import { TreemapConfigPanelItem } from './config_panel/config_panes/config_controls/treemap_config_panel_item';
import { WorkspacePanel } from './workspace_panel';

interface IExplorerVisualizationsProps {
  query: IQuery;
  curVisId: string;
  setCurVisId: (visId: string) => void;
  explorerVis: any;
  explorerFields: ExplorerFields;
  explorerData: any;
  visualizations: IVisualizationContainerProps;
  handleOverrideTimestamp: (field: IField) => void;
  callback?: any;
  queryManager: QueryManager;
  shouldShowConfigurationUI: boolean;
}

export const ExplorerVisualizations = ({
  curVisId,
  setCurVisId,
  explorerVis,
  explorerFields,
  visualizations,
  callback,
  queryManager,
  shouldShowConfigurationUI,
}: IExplorerVisualizationsProps) => {
  const { vis } = visualizations;
  const isMarkDown = vis.id === VIS_CHART_TYPES.Text;
  const fieldOptionList = explorerFields.availableFields.map((field) => ({
    ...field,
    label: field.name,
  }));

  const renderDataConfigContainer = () => {
    switch (curVisId) {
      case VIS_CHART_TYPES.TreeMap:
        return (
          <TreemapConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
          />
        );
      case VIS_CHART_TYPES.LogsView:
        return (
          <LogsViewConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
          />
        );
      default:
        return (
          <DataConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
            queryManager={queryManager}
          />
        );
    }
  };

  const syntheticResize = () => {
    const event = window.document.createEvent('UIEvents');
    event.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(event);
  };

  return (
    <div id="vis__mainContent">
      <EuiResizableContainer onPanelWidthChange={syntheticResize}>
        {(EuiResizablePanel, EuiResizableButton) => (
          <>
            {shouldShowConfigurationUI ? (
              <>
                <EuiResizablePanel
                  initialSize={isMarkDown ? 12 : 20}
                  minSize={isMarkDown ? '10%' : '17%'}
                  mode={['collapsible', { position: 'top' }]}
                  paddingSize="none"
                  className="vis__leftPanel"
                >
                  {!isMarkDown && <>{renderDataConfigContainer()}</>}
                </EuiResizablePanel>
                <EuiResizableButton />
              </>
            ) : (
              <></>
            )}
            <EuiResizablePanel
              className="ws__central--canvas"
              initialSize={80}
              minSize="55%"
              mode="main"
              paddingSize="none"
            >
              <WorkspacePanel
                curVisId={curVisId}
                setCurVisId={setCurVisId}
                visualizations={visualizations}
              />
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              className="ws__configPanel--right"
              initialSize={20}
              minSize="15%"
              mode={['collapsible', { position: 'top' }]}
              paddingSize="none"
            >
              <ConfigPanel
                vizVectors={explorerVis}
                visualizations={visualizations}
                curVisId={curVisId}
                setCurVisId={setCurVisId}
                callback={callback}
              />
            </EuiResizablePanel>
          </>
        )}
      </EuiResizableContainer>
    </div>
  );
};
