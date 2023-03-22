/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPage, EuiPageBody, EuiTabbedContent, EuiTabbedContentTab } from '@elastic/eui';
import React, { useEffect, useMemo, useState } from 'react';
import { Notebook, NotebookProps } from './notebook';
import { NoteTable, NoteTableProps } from './note_table';

type InvestigationTabsProps = NotebookProps & NoteTableProps;

export const InvestigationTabs: React.FC<InvestigationTabsProps> = (props) => {
  const [clickNotebook, setClickNotebook] = useState(false);
  const tabs: EuiTabbedContentTab[] = useMemo(() => {
    return [
      {
        id: 'chat',
        name: 'Chat',
        content: <Notebook {...props} />,
      },
      {
        id: 'compose',
        name: 'Compose',
        content: 'Example 2 content.',
      },
      {
        id: 'insights',
        name: 'Insights',
        content: 'Example 3 content.',
      },
      {
        id: 'history',
        name: 'History',
        content: (
          <EuiPage className="investigations-glass">
            <EuiPageBody component="div">
              <NoteTable
                {...props}
                setOpenedNoteId={(openedNoteId) => {
                  props.setOpenedNoteId(openedNoteId);
                  setClickNotebook(!clickNotebook);
                }}
              />
            </EuiPageBody>
          </EuiPage>
        ),
      },
    ];
  }, [clickNotebook, props.openedNoteId, props.notebooks]);
  const [selectedId, setSelectedId] = useState(tabs[0].id);

  useEffect(() => {
    setSelectedId(tabs[0].id);
  }, [clickNotebook]);

  return (
    <>
      <EuiTabbedContent
        className="investigations-tabs"
        display="condensed"
        size="s"
        tabs={tabs}
        selectedTab={tabs.find((tab) => tab.id === selectedId)}
        onTabClick={(selectedTab) => setSelectedId(selectedTab.id)}
      />
    </>
  );
};
