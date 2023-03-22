/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTextArea } from '@elastic/eui';
import React, { useCallback, useState } from 'react';

interface UserInputProps {
  addPara: (newParaContent: string) => void;
  openNew: () => Promise<void>;
}

export const UserInput: React.FC<UserInputProps> = (props) => {
  const [input, setInput] = useState('');
  const submit = useCallback(() => {
    if (input.length === 0) return;
    setInput('');
    props.addPara('%llm\n' + input);
  }, [input, props.addPara]);

  return (
    <>
      <EuiTextArea
        className="investigations-glass"
        placeholder="Placeholder text"
        autoFocus
        fullWidth
        compressed
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={props.openNew}>
            New Investigation
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={submit}>
            Send
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
