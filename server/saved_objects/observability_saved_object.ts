/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsType } from '../../../../src/core/server';

export const observabilitySavedObject: SavedObjectsType = {
  name: 'observability',
  hidden: false,
  namespaceType: 'single',
  mappings: {
    dynamic: false,
    properties: {
      title: {
        type: 'text',
      },
      description: {
        type: 'text',
      },
      version: { type: 'integer' },
    },
  },
  migrations: {},
};

/* 
  name: VISBUILDER_SAVED_OBJECT,
  hidden: false,
  namespaceType: 'single',
  management: {
    // icon: '', // TODO: Need a custom icon here - unfortunately a custom SVG won't work without changes to the SavedObjectsManagement plugin
    defaultSearchField: 'title',
    importableAndExportable: true,
    getTitle: ({ attributes: { title } }: SavedObject<VisBuilderSavedObjectAttributes>) => title,
    getEditUrl: ({ id }: SavedObject) =>
      `/management/opensearch-dashboards/objects/savedVisBuilder/${encodeURIComponent(id)}`,
    getInAppUrl({ id }: SavedObject) {
      return {
        path: `/app/${PLUGIN_ID}${EDIT_PATH}/${encodeURIComponent(id)}`,
        uiCapabilitiesPath: 'visualization-visbuilder.show',
      };
    },
  },
  migrations: {},
  mappings: {
    properties: {
      title: {
        type: 'text',
      },
      description: {
        type: 'text',
      },
      visualizationState: {
        type: 'text',
        index: false,
      },
      styleState: {
        type: 'text',
        index: false,
      },
      version: { type: 'integer' },
      // Need to add a kibanaSavedObjectMeta attribute here to follow the current saved object flow
      // When we save a saved object, the saved object plugin will extract the search source into two parts
      // Some information will be put into kibanaSavedObjectMeta while others will be created as a reference object and pushed to the reference array
      kibanaSavedObjectMeta: {
        properties: { searchSourceJSON: { type: 'text', index: false } },
      },
    },
  }, */
