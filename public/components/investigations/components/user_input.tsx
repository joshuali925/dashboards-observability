/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTextArea } from '@elastic/eui';
import React, { useState } from 'react';

interface UserInputProps {
  addPara: (newParaContent: string) => void;
}

export const UserInput: React.FC<UserInputProps> = (props) => {
  const [input, setInput] = useState('');
  return (
    <>
      <EuiTextArea
        placeholder="Placeholder text"
        fullWidth
        compressed
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={(e) => {
            props.addPara(input)
          }}>Send</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
