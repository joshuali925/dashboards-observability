/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getVizContainerProps } from '../components/visualizations/charts/helpers';

const data = {
  data: {
    'count()': [
      3, 10, 1, 12, 6, 5, 16, 1, 1, 2, 1, 6, 3, 7, 15, 3, 30, 1, 4, 3, 6, 2, 1, 5, 12, 3, 7, 9, 3,
      5, 78, 2, 1, 3, 1, 1, 1, 4, 2, 2, 2, 3, 2, 1, 2, 2, 5, 3, 2, 2, 2, 3,
    ],
    DestRegion: [
      'AR-B',
      'AT-9',
      'CA-AB',
      'CA-MB',
      'CA-ON',
      'CA-QC',
      'CH-ZH',
      'CO-CUN',
      'DE-BY',
      'DE-HE',
      'DE-NW',
      'EC-P',
      'FI-ES',
      'GB-ENG',
      'IT-21',
      'IT-25',
      'IT-34',
      'IT-45',
      'IT-52',
      'IT-62',
      'IT-72',
      'IT-82',
      'MX-DIF',
      'NO-02',
      'PL-MZ',
      'PR-U-A',
      'RU-AMU',
      'RU-MOS',
      'RU-MUR',
      'SE-AB',
      'SE-BD',
      'US-AZ',
      'US-CA',
      'US-DC',
      'US-FL',
      'US-GA',
      'US-IA',
      'US-IL',
      'US-KS',
      'US-MN',
      'US-MO',
      'US-NC',
      'US-NJ',
      'US-NY',
      'US-OK',
      'US-OR',
      'US-PA',
      'US-TN',
      'US-TX',
      'US-UT',
      'US-VA',
      'US-WA',
    ],
  },
  metadata: {
    fields: [
      {
        name: 'count()',
        type: 'integer',
      },
      {
        name: 'DestRegion',
        type: 'keyword',
      },
    ],
  },
  size: 52,
  status: 200,
  jsonData: [
    {
      'count()': 3,
      DestRegion: 'AR-B',
    },
    {
      'count()': 10,
      DestRegion: 'AT-9',
    },
    {
      'count()': 1,
      DestRegion: 'CA-AB',
    },
    {
      'count()': 12,
      DestRegion: 'CA-MB',
    },
    {
      'count()': 6,
      DestRegion: 'CA-ON',
    },
    {
      'count()': 5,
      DestRegion: 'CA-QC',
    },
    {
      'count()': 16,
      DestRegion: 'CH-ZH',
    },
    {
      'count()': 1,
      DestRegion: 'CO-CUN',
    },
    {
      'count()': 1,
      DestRegion: 'DE-BY',
    },
    {
      'count()': 2,
      DestRegion: 'DE-HE',
    },
    {
      'count()': 1,
      DestRegion: 'DE-NW',
    },
    {
      'count()': 6,
      DestRegion: 'EC-P',
    },
    {
      'count()': 3,
      DestRegion: 'FI-ES',
    },
    {
      'count()': 7,
      DestRegion: 'GB-ENG',
    },
    {
      'count()': 15,
      DestRegion: 'IT-21',
    },
    {
      'count()': 3,
      DestRegion: 'IT-25',
    },
    {
      'count()': 30,
      DestRegion: 'IT-34',
    },
    {
      'count()': 1,
      DestRegion: 'IT-45',
    },
    {
      'count()': 4,
      DestRegion: 'IT-52',
    },
    {
      'count()': 3,
      DestRegion: 'IT-62',
    },
    {
      'count()': 6,
      DestRegion: 'IT-72',
    },
    {
      'count()': 2,
      DestRegion: 'IT-82',
    },
    {
      'count()': 1,
      DestRegion: 'MX-DIF',
    },
    {
      'count()': 5,
      DestRegion: 'NO-02',
    },
    {
      'count()': 12,
      DestRegion: 'PL-MZ',
    },
    {
      'count()': 3,
      DestRegion: 'PR-U-A',
    },
    {
      'count()': 7,
      DestRegion: 'RU-AMU',
    },
    {
      'count()': 9,
      DestRegion: 'RU-MOS',
    },
    {
      'count()': 3,
      DestRegion: 'RU-MUR',
    },
    {
      'count()': 5,
      DestRegion: 'SE-AB',
    },
    {
      'count()': 78,
      DestRegion: 'SE-BD',
    },
    {
      'count()': 2,
      DestRegion: 'US-AZ',
    },
    {
      'count()': 1,
      DestRegion: 'US-CA',
    },
    {
      'count()': 3,
      DestRegion: 'US-DC',
    },
    {
      'count()': 1,
      DestRegion: 'US-FL',
    },
    {
      'count()': 1,
      DestRegion: 'US-GA',
    },
    {
      'count()': 1,
      DestRegion: 'US-IA',
    },
    {
      'count()': 4,
      DestRegion: 'US-IL',
    },
    {
      'count()': 2,
      DestRegion: 'US-KS',
    },
    {
      'count()': 2,
      DestRegion: 'US-MN',
    },
    {
      'count()': 2,
      DestRegion: 'US-MO',
    },
    {
      'count()': 3,
      DestRegion: 'US-NC',
    },
    {
      'count()': 2,
      DestRegion: 'US-NJ',
    },
    {
      'count()': 1,
      DestRegion: 'US-NY',
    },
    {
      'count()': 2,
      DestRegion: 'US-OK',
    },
    {
      'count()': 2,
      DestRegion: 'US-OR',
    },
    {
      'count()': 5,
      DestRegion: 'US-PA',
    },
    {
      'count()': 3,
      DestRegion: 'US-TN',
    },
    {
      'count()': 2,
      DestRegion: 'US-TX',
    },
    {
      'count()': 2,
      DestRegion: 'US-UT',
    },
    {
      'count()': 2,
      DestRegion: 'US-VA',
    },
    {
      'count()': 3,
      DestRegion: 'US-WA',
    },
  ],
};
export const sampleVisProps = getVizContainerProps({
  vizId: 'bar',
  rawVizData: data,
  query: {
    rawQuery: 'source = opensearch_dashboards_sample_data_flights | stats count() by DestRegion',
  },
  indexFields: {},
  userConfigs: {
    availabilityConfig: {},
    dataConfig: {
      series: [
        {
          label: '',
          name: '',
          aggregation: 'count',
          customLabel: '',
        },
      ],
      dimensions: [
        {
          label: 'DestRegion',
          name: 'DestRegion',
          customLabel: '',
        },
      ],
      breakdowns: [],
    },
    layoutConfig: {},
  },
  explorer: { explorerData: data, explorerFields: data.metadata.fields },
});
