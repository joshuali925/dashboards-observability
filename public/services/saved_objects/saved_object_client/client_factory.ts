/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

type SavedObjectsClientType = 'osd' | 'ppl';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getTypeById = (objectId: string): SavedObjectsClientType => {
  if (UUID_REGEX.test(objectId)) {
    return 'osd';
  }
  return 'ppl';
};

export const getSavedObjectsClientByObjectId = (objectId: string) => {
  const type = getTypeById(objectId)
  switch (type) {
    case 'osd':
      
      break;
    case 'ppl':

    default:
      break;
  }
};
