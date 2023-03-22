/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiContextMenuItem,
  EuiFieldSearch,
  EuiHorizontalRule,
  EuiInMemoryTable,
  EuiLink,
  EuiOverlayMask,
  EuiTableFieldDataColumnType,
} from '@elastic/eui';
import _ from 'lodash';
import moment from 'moment';
import React, { ReactElement, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CREATE_NOTE_MESSAGE } from '../../../../common/constants/notebooks';
import { UI_DATE_FORMAT } from '../../../../common/constants/shared';
import { DeleteNotebookModal, getCustomModal } from './helpers/modal_containers';
import { NotebookType } from './main';

export interface NoteTableProps {
  loading: boolean;
  fetchNotebooks: () => void;
  notebooks: NotebookType[];
  setOpenedNoteId: (openedNoteId: string) => void;
  createNotebook: (newNoteName: string) => Promise<string>;
  renameNotebook: (newNoteName: string, noteId: string) => void;
  cloneNotebook: (newNoteName: string, noteId: string) => void;
  deleteNotebook: (noteList: string[], toastMessage?: string) => void;
  setToast: (title: string, color?: string, text?: string) => void;
}

export function NoteTable(props: NoteTableProps) {
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal Toggle
  const [modalLayout, setModalLayout] = useState(<EuiOverlayMask />); // Modal Layout
  const [isActionsPopoverOpen, setIsActionsPopoverOpen] = useState(false);
  const [selectedNotebooks, setSelectedNotebooks] = useState<NotebookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const history = useHistory();
  const { notebooks, createNotebook, renameNotebook, cloneNotebook, deleteNotebook } = props;

  useEffect(() => {
    props.fetchNotebooks();
  }, []);

  useEffect(() => {
    const url = window.location.hash.split('/');
    if (url[url.length - 1] === 'create') {
      createNote();
    }
  }, [location]);

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const showModal = () => {
    setIsModalVisible(true);
  };

  const onCreate = async (newNoteName: string) => {
    createNotebook(newNoteName);
    closeModal();
  };

  const onRename = async (newNoteName: string) => {
    renameNotebook(newNoteName, selectedNotebooks[0].id);
    closeModal();
  };

  const onClone = async (newName: string) => {
    cloneNotebook(newName, selectedNotebooks[0].id);
    closeModal();
  };

  const onDelete = async () => {
    const toastMessage = `Investigation${
      selectedNotebooks.length > 1 ? 's' : ' "' + selectedNotebooks[0].path + '"'
    } successfully deleted!`;
    await deleteNotebook(
      selectedNotebooks.map((note) => note.id),
      toastMessage
    );
    closeModal();
  };

  const createNote = () => {
    setModalLayout(
      getCustomModal(
        onCreate,
        () => {
          closeModal();
          history.goBack();
        },
        'Name',
        'Create investigation',
        'Cancel',
        'Create',
        undefined,
        CREATE_NOTE_MESSAGE
      )
    );
    showModal();
  };

  const renameNote = () => {
    setModalLayout(
      getCustomModal(
        onRename,
        closeModal,
        'Name',
        'Rename investigation',
        'Cancel',
        'Rename',
        selectedNotebooks[0].path,
        CREATE_NOTE_MESSAGE
      )
    );
    showModal();
  };

  const cloneNote = () => {
    setModalLayout(
      getCustomModal(
        onClone,
        closeModal,
        'Name',
        'Duplicate investigation',
        'Cancel',
        'Duplicate',
        selectedNotebooks[0].path + ' (copy)',
        CREATE_NOTE_MESSAGE
      )
    );
    showModal();
  };

  const deleteNote = () => {
    const investigationString = `investigation${selectedInvestigations.length > 1 ? 's' : ''}`;
    setModalLayout(
      <DeleteNotebookModal
        onConfirm={onDelete}
        onCancel={closeModal}
        title={`Delete ${selectedNotebooks.length} ${notebookString}`}
        message={`Are you sure you want to delete the selected ${selectedNotebooks.length} ${notebookString}?`}
      />
    );
    showModal();
  };

  const popoverButton = (
    <EuiButton
      iconType="arrowDown"
      iconSide="right"
      onClick={() => setIsActionsPopoverOpen(!isActionsPopoverOpen)}
    >
      Actions
    </EuiButton>
  );

  const popoverItems: ReactElement[] = [
    <EuiContextMenuItem
      key="rename"
      disabled={notebooks.length === 0 || selectedNotebooks.length !== 1}
      onClick={() => {
        setIsActionsPopoverOpen(false);
        renameNote();
      }}
    >
      Rename
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="duplicate"
      disabled={notebooks.length === 0 || selectedNotebooks.length !== 1}
      onClick={() => {
        setIsActionsPopoverOpen(false);
        cloneNote();
      }}
    >
      Duplicate
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="delete"
      disabled={notebooks.length === 0 || selectedNotebooks.length === 0}
      onClick={() => {
        setIsActionsPopoverOpen(false);
        deleteNote();
      }}
    >
      Delete
    </EuiContextMenuItem>,
  ];

  const tableColumns = [
    {
      field: 'path',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render: (value, record) => (
        <EuiLink onClick={() => props.setOpenedNoteId(record.id)}>
          {_.truncate(value, { length: 100 })}
        </EuiLink>
      ),
    },
    {
      field: 'dateModified',
      name: 'Last updated',
      sortable: true,
      render: (value) => moment(value).format(UI_DATE_FORMAT),
    },
    {
      field: 'dateCreated',
      name: 'Created',
      sortable: true,
      render: (value) => moment(value).format(UI_DATE_FORMAT),
    },
  ] as Array<
    EuiTableFieldDataColumnType<{
      path: string;
      id: string;
      dateCreated: string;
      dateModified: string;
    }>
  >;

  return (
    <>
      <EuiFieldSearch
        fullWidth
        placeholder="Search investigation name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <EuiHorizontalRule margin="m" />
      <EuiInMemoryTable
        loading={props.loading}
        items={
          searchQuery
            ? notebooks.filter((notebook) =>
                notebook.path.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : notebooks
        }
        itemId="id"
        columns={tableColumns}
        tableLayout="auto"
        pagination={{
          initialPageSize: 10,
          pageSizeOptions: [10, 20, 50],
        }}
        sorting={{
          sort: {
            field: 'dateModified',
            direction: 'desc',
          },
        }}
        allowNeutralSort={false}
        isSelectable={true}
        selection={{
          onSelectionChange: (items) => setSelectedNotebooks(items),
        }}
      />
    </>
  );

  // return (
  //   <div style={pageStyles}>
  //     <EuiPage>
  //       <EuiPageBody component="div">
  //         <EuiPageHeader>
  //           <EuiPageHeaderSection>
  //             <EuiTitle size="l">
  //               <h1>Investigations</h1>
  //             </EuiTitle>
  //           </EuiPageHeaderSection>
  //         </EuiPageHeader>
  //         <EuiPageContent id="investigationArea">
  //           <EuiPageContentHeader>
  //             <EuiPageContentHeaderSection>
  //               <EuiTitle size="s">
  //                 <h3>
  //                   Investigations<span className="panel-header-count"> ({notebooks.length})</span>
  //                 </h3>
  //               </EuiTitle>
  //               <EuiSpacer size="s" />
  //               <EuiText size="s" color="subdued">
  //                 Use Investigations to interactively and collaboratively develop rich reports backed by
  //                 live data. Common use cases for investigations includes creating postmortem reports,
  //                 designing run books, building live infrastructure reports, or even documentation.{' '}
  //                 <EuiLink external={true} href={NOTEBOOKS_DOCUMENTATION_URL} target="blank">
  //                   Learn more
  //                 </EuiLink>
  //               </EuiText>
  //             </EuiPageContentHeaderSection>
  //             <EuiPageContentHeaderSection>
  //               <EuiFlexGroup gutterSize="s">
  //                 <EuiFlexItem>
  //                   <EuiPopover
  //                     panelPaddingSize="none"
  //                     button={popoverButton}
  //                     isOpen={isActionsPopoverOpen}
  //                     closePopover={() => setIsActionsPopoverOpen(false)}
  //                   >
  //                     <EuiContextMenuPanel items={popoverItems} />
  //                   </EuiPopover>
  //                 </EuiFlexItem>
  //                 <EuiFlexItem>
  //                   <EuiButton fill href="#/investigations/create">
  //                     Create investigation
  //                   </EuiButton>
  //                 </EuiFlexItem>
  //               </EuiFlexGroup>
  //             </EuiPageContentHeaderSection>
  //           </EuiPageContentHeader>
  //           <EuiHorizontalRule margin="m" />
  //           {notebooks.length > 0 ? (
  //             <>
  //               <EuiFieldSearch
  //                 fullWidth
  //                 placeholder="Search investigation name"
  //                 value={searchQuery}
  //                 onChange={(e) => setSearchQuery(e.target.value)}
  //               />
  //               <EuiHorizontalRule margin="m" />
  //               <EuiInMemoryTable
  //                 loading={props.loading}
  //                 items={
  //                   searchQuery
  //                     ? notebooks.filter((notebook) =>
  //                         notebook.path.toLowerCase().includes(searchQuery.toLowerCase())
  //                       )
  //                     : notebooks
  //                 }
  //                 itemId="id"
  //                 columns={tableColumns}
  //                 tableLayout="auto"
  //                 pagination={{
  //                   initialPageSize: 10,
  //                   pageSizeOptions: [8, 10, 13],
  //                 }}
  //                 sorting={{
  //                   sort: {
  //                     field: 'dateModified',
  //                     direction: 'desc',
  //                   },
  //                 }}
  //                 allowNeutralSort={false}
  //                 isSelectable={true}
  //                 selection={{
  //                   onSelectionChange: (items) => setSelectedNotebooks(items),
  //                 }}
  //               />
  //             </>
  //           ) : (
  //             <>
  //               <EuiSpacer size="xxl" />
  //               <EuiText textAlign="center">
  //                 <h2>No investigations</h2>
  //                 <EuiSpacer size="m" />
  //                 <EuiText color="subdued">
  //                   Use investigations to create post-mortem reports, build live infrastructure
  //                   <br />
  //                   reports, or foster explorative collaborations with data.
  //                 </EuiText>
  //               </EuiText>
  //               <EuiSpacer size="m" />
  //               <EuiFlexGroup justifyContent="center">
  //                 <EuiFlexItem grow={false}>
  //                   <EuiButton href="#/investigations/create"
  //                     data-test-subj="note-table-empty-state-create-notebook-button"
  //                     fullWidth={false}
  //                   >
  //                     Create investigation
  //                   </EuiButton>
  //                 </EuiFlexItem>
  //                 <EuiFlexItem grow={false}>
  //                   <EuiButton fullWidth={false} onClick={() => addSampleNotebooks()}>
  //                     Add samples
  //                   </EuiButton>
  //                 </EuiFlexItem>
  //               </EuiFlexGroup>
  //               <EuiSpacer size="xxl" />
  //             </>
  //           )}
  //         </EuiPageContent>
  //       </EuiPageBody>
  //     </EuiPage>
  //     {isModalVisible && modalLayout}
  //   </div>
  // );
}
