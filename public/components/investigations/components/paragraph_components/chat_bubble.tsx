/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import React from 'react';

interface ChatBubbleProps {
  input?: React.ReactNode;
  output?: React.ReactNode;
}

export const ChatBubble: React.FC<ChatBubbleProps> = (props) => {
  return (
    <>
      {props.input && (
        <>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiPanel
                grow={false}
                paddingSize="none"
                color="plain"
                hasBorder
                className="investigations-chat-dialog"
                style={{ backgroundColor: '#3a71e2' }}
              >
                <EuiText color="ghost" style={{ whiteSpace: 'pre-line' }}>
                  {props.input}
                </EuiText>
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
        </>
      )}
      {props.output && (
        <>
          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={false}>
              <EuiPanel
                grow={false}
                paddingSize="none"
                color="plain"
                hasBorder
                className="investigations-chat-dialog"
              >
                {props.output}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
        </>
      )}
    </>
  );
};
