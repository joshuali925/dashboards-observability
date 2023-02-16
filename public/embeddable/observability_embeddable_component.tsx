/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import {
  SavedObjectEmbeddableInput,
  withEmbeddableSubscription,
} from '../../../../src/plugins/embeddable/public';
import { QueryManager } from '../../common/query_manager';
import { IVisualizationContainerProps } from '../../common/types/explorer';
import { removeBacktick } from '../../common/utils';
import { getPPLService } from '../../common/utils/settings_service';
import { getDefaultVisConfig } from '../components/event_analytics/utils';
import { getVizContainerProps } from '../components/visualizations/charts/helpers';
import { Visualization } from '../components/visualizations/visualization';
import { ObservabilityEmbeddable, ObservabilityOutput } from './observability_embeddable';

interface ObservabilityEmbeddableComponentProps {
  input: SavedObjectEmbeddableInput;
  output: ObservabilityOutput;
  embeddable: ObservabilityEmbeddable;
}

const ObservabilityEmbeddableComponentInner: React.FC<ObservabilityEmbeddableComponentProps> = (
  props
) => {
  console.log('❗embeddable attributes:', props.output.attributes);
  const [visContainerProps, setVisContainerProps] = useState<IVisualizationContainerProps>();
  const pplService = getPPLService();

  useEffect(() => {
    const visualization = props.output.attributes?.savedVisualization!;
    console.log('❗visualization:', visualization);
    if (!visualization) return;
    const metaData = { ...visualization, query: visualization.query };
    const dataConfig = { ...(metaData.user_configs?.dataConfig || {}) };
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
        ...(metaData.user_configs?.availabilityConfig || {}),
      },
      dataConfig: {
        ...finalDataConfig,
      },
      layoutConfig: {
        ...(metaData.user_configs?.layoutConfig || {}),
      },
    };

    pplService
      .fetch({ query: visualization.query, format: 'viz' })
      .then((data) => {
        const p = getVizContainerProps({
          vizId: visualization.type,
          rawVizData: data,
          query: { rawQuery: metaData.query },
          indexFields: {},
          userConfigs: mixedUserConfigs,
          explorer: { explorerData: data, explorerFields: data.metadata.fields },
        });
        console.log('❗p:', p);
        setVisContainerProps(p);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }, [props]);

  return (
    <>
      {/* <div>{JSON.stringify(props.output.attributes, null, 2)}</div> */}
      {/* <Visualization visualizations={sampleVisProps} /> */}
      {visContainerProps && <Visualization visualizations={visContainerProps} />}
    </>
  );
};

export const ObservabilityEmbeddableComponent = withEmbeddableSubscription<
  SavedObjectEmbeddableInput,
  ObservabilityOutput,
  ObservabilityEmbeddable,
  {}
>(ObservabilityEmbeddableComponentInner);
