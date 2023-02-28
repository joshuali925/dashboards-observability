/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { i18n } from '@osd/i18n';
import { createAction } from '../../../../src/plugins/ui_actions/public';
import { toMountPoint } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { ViewMode, SavedObjectEmbeddableInput } from '../../../../src/plugins/embeddable/public';
import { CreateEditBookComponent } from './create_edit_book_component';
import { DashboardStart } from '../../../../src/plugins/dashboard/public';
import { OnSaveProps } from '../../../../src/plugins/saved_objects/public';
import { SavedObjectsClientContract } from '../../../../src/core/target/types/public/saved_objects';

interface StartServices {
  openModal: OverlayStart['openModal'];
  getAttributeService: DashboardStart['getAttributeService'];
  savedObjectsClient: SavedObjectsClientContract;
}

interface ActionContext {
  embeddable: BookEmbeddable;
}

export const ACTION_EDIT_BOOK = 'ACTION_EDIT_BOOK';

export const createEditBookAction = (getStartServices: () => Promise<StartServices>) =>
  createAction({
    getDisplayName: () =>
      i18n.translate('embeddableExamples.book.edit', { defaultMessage: 'Edit Book' }),
    type: ACTION_EDIT_BOOK,
    order: 100,
    getIconType: () => 'documents',
    isCompatible: async ({ embeddable }: ActionContext) => {
      return (
        embeddable.type === BOOK_EMBEDDABLE && embeddable.getInput().viewMode === ViewMode.EDIT
      );
    },
    execute: async ({ embeddable }: ActionContext) => {
      const { openModal, getAttributeService, savedObjectsClient } = await getStartServices();
      const attributeService = getAttributeService<BookSavedObjectAttributes>(BOOK_SAVED_OBJECT, {
        saveMethod: async (attributes: BookSavedObjectAttributes, savedObjectId?: string) => {
          if (savedObjectId) {
            return savedObjectsClient.update(BOOK_EMBEDDABLE, savedObjectId, attributes);
          }
          return savedObjectsClient.create(BOOK_EMBEDDABLE, attributes);
        },
        checkForDuplicateTitle: (props: OnSaveProps) => {
          return new Promise(() => {
            return true;
          });
        },
      });
      const onSave = async (attributes: BookSavedObjectAttributes, useRefType: boolean) => {
        const newInput = await attributeService.wrapAttributes(
          attributes,
          useRefType,
          attributeService.getExplicitInputFromEmbeddable(embeddable)
        );
        if (!useRefType && (embeddable.getInput() as SavedObjectEmbeddableInput).savedObjectId) {
          // Set the saved object ID to null so that update input will remove the existing savedObjectId...
          (newInput as BookByValueInput & { savedObjectId: unknown }).savedObjectId = null;
        }
        embeddable.updateInput(newInput);
        if (useRefType) {
          // Ensures that any duplicate embeddables also register the changes. This mirrors the behavior of going back and forth between apps
          embeddable.getRoot().reload();
        }
      };
      const overlay = openModal(
        toMountPoint(
          <CreateEditBookComponent
            savedObjectId={(embeddable.getInput() as BookByReferenceInput).savedObjectId}
            attributes={embeddable.getOutput().attributes}
            onSave={(attributes: BookSavedObjectAttributes, useRefType: boolean) => {
              overlay.close();
              onSave(attributes, useRefType);
            }}
          />
        )
      );
    },
  });
