/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiTabbedContent, EuiTabbedContentTab } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { Notebook, NotebookProps } from './notebook';
import { NoteTable, NoteTableProps } from './note_table';

type InvestigationTabsProps = NotebookProps & NoteTableProps;

export const InvestigationTabs: React.FC<InvestigationTabsProps> = (props) => {
  const [clickNotebook, setClickNotebook] = useState(false);
  const tabs: EuiTabbedContentTab[] = [
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
        <NoteTable
          {...props}
          setOpenedNoteId={(openedNoteId) => {
            props.setOpenedNoteId(openedNoteId);
            setClickNotebook(!clickNotebook);
          }}
        />
      ),
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  useEffect(() => {
    setSelectedTab(tabs[0]);
  }, [clickNotebook]);

  return (
    <>
      <EuiTabbedContent
        display="condensed"
        size="s"
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={(selectedTab) => setSelectedTab(selectedTab)}
      />
    </>
  );
};
