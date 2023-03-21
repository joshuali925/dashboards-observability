/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiTabbedContent, EuiTabbedContentTab } from '@elastic/eui';
import React, { useState } from 'react';
import { Notebook, NotebookProps } from './notebook';
import { NoteTable, NoteTableProps } from './note_table';

type InvestigationTabsProps = NotebookProps & NoteTableProps;

export const InvestigationTabs: React.FC<InvestigationTabsProps> = (props) => {
  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'chat',
      name: 'Chat',
      content: <Notebook {...props} />,
    },
    {
      id: 'compose',
      name: 'Compose',
      content: (
        <NoteTable
          {...props}
          setOpenedNoteId={(openedNoteId: string) => {
            props.setOpenedNoteId(openedNoteId);
            setSelectedTab(tabs[0]);
          }}
        />
      ),
    },
    {
      id: 'insights',
      name: 'Insights',
      content: 'Example 3 content.',
    },
    {
      id: 'history',
      name: 'History',
      content: 'Example 4 content.',
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

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
