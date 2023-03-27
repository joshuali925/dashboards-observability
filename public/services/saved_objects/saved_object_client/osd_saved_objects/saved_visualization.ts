/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimpleSavedObject } from '../../../../../../../src/core/public';
import { IField } from '../../../../../common/types/explorer';
import {
  VisualizationSavedObjectAttributes,
  VISUALIZATION_SAVED_OBJECT,
} from '../../../../../common/types/observability_saved_object_attributes';
import { OSDSavedObjectClient } from './osd_saved_object_client';

interface CommonParams {
  query: string;
  fields: IField[];
  dateRange: [string, string];
  type: string;
  name: string;
  timestamp: string;
  applicationId: string;
  userConfigs: any;
  description: string;
  subType: string;
  unitsOfMeasure: string;
  selectedLabels: string;
}

type CreateParams = CommonParams & { applicationId: string };
type UpdateParams = CommonParams & { objectId: string };

export class OSDSavedVisualizationClient extends OSDSavedObjectClient {
  async create(
    params: CreateParams
  ): Promise<SimpleSavedObject<VisualizationSavedObjectAttributes>> {
    const body = this.buildRequestBody({
      query: params.query,
      fields: params.fields,
      dateRange: params.dateRange,
      chartType: params.type,
      name: params.name,
      timestamp: params.timestamp,
      applicationId: params.applicationId,
      userConfigs: params.userConfigs,
      description: params.description,
      subType: params.subType,
      unitsOfMeasure: params.unitsOfMeasure,
      selectedLabels: params.selectedLabels,
    });
    return this.client.create<VisualizationSavedObjectAttributes>(VISUALIZATION_SAVED_OBJECT, {
      title: params.name,
      description: params.description,
      version: 1,
      savedVisualization: body.object,
    });
  }
}
