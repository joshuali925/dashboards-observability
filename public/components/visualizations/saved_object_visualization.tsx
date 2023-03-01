/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { SizeMe } from 'react-sizeme';
import { TimeRange } from '../../../../../src/plugins/data/common';
import { QueryManager } from '../../../common/query_manager';
import { IVisualizationContainerProps, SavedVisualization } from '../../../common/types/explorer';
import { composeFinalQuery, getPPLService, removeBacktick } from '../../../common/utils';
import { getDefaultVisConfig } from '../event_analytics/utils';
import { getVizContainerProps } from './charts/helpers';
import { Visualization } from './visualization';

interface SavedObjectVisualizationProps {
  savedVisualization: SavedVisualization;
  timeRange?: TimeRange;
}

/**
 * Renders a visualization from a {@link SavedVisualization}.
 */
export const SavedObjectVisualization: React.FC<SavedObjectVisualizationProps> = (props) => {
  const [visContainerProps, setVisContainerProps] = useState<IVisualizationContainerProps>();

  useEffect(() => {
    const pplService = getPPLService();
    const metaData = { ...props.savedVisualization, query: props.savedVisualization.query };
    const userConfigs = JSON.parse(metaData.user_configs);
    const dataConfig = { ...(userConfigs.dataConfig || {}) };
    const hasBreakdowns = !_.isEmpty(dataConfig.breakdowns);
    const realTimeParsedStats = {
      ...getDefaultVisConfig(new QueryManager().queryParser().parse(metaData.query).getStats()),
    };
    let finalDimensions = [...(realTimeParsedStats.dimensions || [])];
    const breakdowns = [...(dataConfig.breakdowns || [])];

    // filter out breakdowns from dimnesions
    if (hasBreakdowns) {
      finalDimensions = _.differenceWith(finalDimensions, breakdowns, (dimn, brkdwn) =>
        _.isEqual(removeBacktick(dimn.name), removeBacktick(brkdwn.name))
      );
    }

    const finalDataConfig = {
      ...dataConfig,
      ...realTimeParsedStats,
      dimensions: finalDimensions,
      breakdowns,
    };

    const mixedUserConfigs = {
      availabilityConfig: {
        ...(userConfigs.availabilityConfig || {}),
      },
      dataConfig: {
        ...finalDataConfig,
      },
      layoutConfig: {
        ...(userConfigs.layoutConfig || {}),
      },
    };

    let query = metaData.query;

    if (props.timeRange) {
      query = composeFinalQuery(
        metaData.query,
        props.timeRange.from,
        props.timeRange.to,
        props.savedVisualization.selected_timestamp.name,
        false,
        ''
      );
    }

    pplService
      .fetch({ query, format: 'viz' })
      .then((data) => {
        console.log('❗data:', data);
        const container = getVizContainerProps({
          vizId: props.savedVisualization.type,
          rawVizData: data,
          query: { rawQuery: metaData.query },
          indexFields: {},
          userConfigs: mixedUserConfigs,
          explorer: { explorerData: data, explorerFields: data.metadata.fields },
        });
        setVisContainerProps(container);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }, [props]);

  return visContainerProps ? (
    <SizeMe>{({ size }) => <Visualization visualizations={visContainerProps} />}</SizeMe>
  ) : null;
};
