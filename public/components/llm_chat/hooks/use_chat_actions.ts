/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { produce } from 'immer';
import { useContext } from 'react';
import { OBSERVABILITY_BASE } from '../../../../common/constants/shared';
import { IConversation } from '../../../../common/types/observability_saved_object_attributes';
import { ChatContext, ConversationContext, CoreServicesContext } from '../header_chat_button';

interface SendResponse {
  chatId: string;
  conversations: IConversation[];
}

export const useChatActions = () => {
  const chatContext = useContext(ChatContext)!;
  const coreServicesContext = useContext(CoreServicesContext)!;
  const conversationContext = useContext(ConversationContext)!;

  const send = async (input: IConversation) => {
    conversationContext.setLocalConversation(
      produce((draft) => {
        draft.conversations.push(input);
        draft.llmError = undefined;
        draft.llmResponding = true;
      })
    );
    try {
      const response = await coreServicesContext.http.post<SendResponse>(
        `${OBSERVABILITY_BASE}/chat/send`,
        {
          body: JSON.stringify({
            chatId: chatContext.chatId,
            localConversations: conversationContext.localConversation.conversations,
            input,
          }),
        }
      );
      console.log('❗response:', response);
      chatContext.setChatId(response.chatId);
      conversationContext.setLocalConversation({
        llmError: undefined,
        llmResponding: false,
        conversations: response.conversations,
      });
    } catch (error) {
      conversationContext.setLocalConversation(
        produce((draft) => {
          draft.llmError = error;
          draft.llmResponding = false;
        })
      );
    }
  };

  return { send };
};
