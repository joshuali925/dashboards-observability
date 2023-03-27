/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isEmpty } from 'lodash';
import { SavedObjectClientBase } from '../client_base';
import { ISavedObjectsClient } from '../client_interface';
import { HttpStart, SavedObjectsClientContract } from '../../../../../../../src/core/public';

export class OSDSavedObjectClient extends SavedObjectClientBase implements ISavedObjectsClient {
  constructor(protected readonly client: SavedObjectsClientContract) {
    super();
  }
  create(params: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  get(params: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  getBulk(params: unknown): Promise<Array<Promise<unknown>>> {
    throw new Error('Method not implemented.');
  }
  update(params: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  updateBulk(params: unknown): Promise<Array<Promise<unknown>>> {
    throw new Error('Method not implemented.');
  }
  delete(params: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  deleteBulk(params: unknown): Promise<Array<Promise<unknown>>> {
    throw new Error('Method not implemented.');
  }
  buildRequestBody({
    query,
    fields,
    dateRange,
    timestamp,
    name = '',
    chartType = '',
    description = '',
    applicationId = '',
    userConfigs = '',
    subType = '',
    unitsOfMeasure = '',
    selectedLabels,
    objectId = '',
  }: any) {
    const objRequest: any = {
      object: {
        query,
        selected_date_range: {
          start: dateRange[0] || 'now/15m',
          end: dateRange[1] || 'now',
          text: '',
        },
        selected_timestamp: {
          name: timestamp || '',
          type: 'timestamp',
        },
        selected_fields: {
          tokens: fields,
          text: '',
        },
        name: name || '',
        description: description || '',
      },
    };

    if (!isEmpty(chartType)) {
      objRequest.object.type = chartType;
    }

    if (!isEmpty(applicationId)) {
      objRequest.object.application_id = applicationId;
    }

    if (!isEmpty(userConfigs)) {
      objRequest.object.user_configs = userConfigs;
    }

    if (!isEmpty(subType)) {
      objRequest.object.sub_type = subType;
    }

    if (!isEmpty(unitsOfMeasure)) {
      objRequest.object.units_of_measure = unitsOfMeasure;
    }

    if (!isEmpty(selectedLabels)) {
      objRequest.object.selected_labels = selectedLabels;
    }

    if (!isEmpty(objectId)) {
      objRequest.object_id = objectId;
    }

    return objRequest;
  }
}
