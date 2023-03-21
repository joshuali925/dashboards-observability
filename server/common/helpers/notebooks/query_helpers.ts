/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeType, CODE_TYPE_REGEX } from '../../../../common/types/notebooks';
import QueryService from '../../../services/queryService';

export const inputIsQuery = (inputText: string) => {
  const codeType = getCodeInputType(inputText);
  return codeType === 'sql' || codeType === 'ppl';
};

export const getCodeInputType = (input: string): CodeType | undefined => {
  return Object.entries(CODE_TYPE_REGEX).find(([type, regex]) => regex.test(input))?.[0] as
    | CodeType
    | undefined;
};

export const stripTypeFromInput = (inputText: string) => {
  const codeType = getCodeInputType(inputText);
  if (codeType) return inputText.replace(CODE_TYPE_REGEX[codeType], '');
  return inputText;
};

export const getQueryOutput = async (inputText: string, queryService: QueryService) => {
  let output = {};
  const codeType = getCodeInputType(inputText);
  if (codeType === 'sql') {
    output = await queryService.describeSQLQuery(inputText);
  } else if (codeType === 'ppl') {
    output = await queryService.describePPLQuery(inputText);
  }
  return output;
};

export const formatNotRecognized = (inputText: string) => {
  return getCodeInputType(inputText) === undefined;
};
