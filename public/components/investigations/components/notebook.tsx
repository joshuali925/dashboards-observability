/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonGroupOptionProps,
  EuiContextMenuPanelDescriptor,
  EuiHorizontalRule,
  EuiOverlayMask,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import moment from 'moment';
import React, { Component } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { DashboardStart } from '../../../../../../src/plugins/dashboard/public';
import {
  CREATE_NOTE_MESSAGE,
  NOTEBOOKS_API_PREFIX,
  NOTEBOOKS_SELECTED_BACKEND,
} from '../../../../common/constants/notebooks';
import { UI_DATE_FORMAT } from '../../../../common/constants/shared';
import { ParaType } from '../../../../common/types/notebooks';
import PPLService from '../../../services/requests/ppl';
import { defaultParagraphParser } from './helpers/default_parser';
import { DeleteNotebookModal, getCustomModal, getDeleteModal } from './helpers/modal_containers';
import { zeppelinParagraphParser } from './helpers/zeppelin_parser';
import { Paragraphs } from './paragraph_components/paragraphs';
import { UserInput } from './user_input';

/*
 * "Investigation" component is used to display an open investigation
 *
 * Props taken in as params are:
 * DashboardContainerByValueRenderer - Dashboard container renderer for visualization
 * http object - for making API requests
 */
export type NotebookProps = {
  pplService: PPLService;
  openedNoteId: string;
  setOpenedNoteId: (openedNoteId: string) => Promise<void>;
  DashboardContainerByValueRenderer: DashboardStart['DashboardContainerByValueRenderer'];
  http: CoreStart['http'];
  createNotebook: (newNoteName: string) => Promise<string>;
  renameNotebook: (newNoteName: string, noteId: string) => void;
  cloneNotebook: (newNoteName: string, noteId: string) => Promise<string>;
  deleteNotebook: (noteList: string[], toastMessage?: string) => void;
  setToast: (title: string, color?: string, text?: string) => void;
};

type NotebookState = {
  selectedViewId: string;
  path: string;
  dateCreated: string;
  dateModified: string;
  paragraphs: any; // notebook paragraphs fetched from API
  parsedPara: Array<ParaType>; // paragraphs parsed to a common format
  vizPrefix: string; // prefix for visualizations in Zeppelin Adaptor
  isAddParaPopoverOpen: boolean;
  isParaActionsPopoverOpen: boolean;
  isNoteActionsPopoverOpen: boolean;
  isModalVisible: boolean;
  modalLayout: React.ReactNode;
  showQueryParagraphError: boolean;
  queryParagraphErrorMessage: string;
};
export class Notebook extends Component<NotebookProps, NotebookState> {
  constructor(props: Readonly<NotebookProps>) {
    super(props);
    this.state = {
      selectedViewId: 'output_only',
      path: '',
      dateCreated: '',
      dateModified: '',
      paragraphs: [],
      parsedPara: [],
      vizPrefix: '',
      isAddParaPopoverOpen: false,
      isParaActionsPopoverOpen: false,
      isNoteActionsPopoverOpen: false,
      isModalVisible: false,
      modalLayout: <EuiOverlayMask></EuiOverlayMask>,
      showQueryParagraphError: false,
      queryParagraphErrorMessage: '',
    };
  }

  parseAllParagraphs = () => {
    let parsedPara = this.parseParagraphs(this.state.paragraphs);
    this.setState({ parsedPara });
  };

  // parse paragraphs based on backend
  parseParagraphs = (paragraphs: any[]): ParaType[] => {
    try {
      let parsedPara;
      // @ts-ignore
      if (NOTEBOOKS_SELECTED_BACKEND === 'ZEPPELIN') {
        parsedPara = zeppelinParagraphParser(paragraphs);
        this.setState({ vizPrefix: '%sh #vizobject:' });
      } else {
        parsedPara = defaultParagraphParser(paragraphs);
      }
      parsedPara.forEach((para: ParaType) => {
        para.isInputExpanded = this.state.selectedViewId === 'input_only';
        para.paraRef = React.createRef();
        para.paraDivRef = React.createRef<HTMLDivElement>();
      });
      return parsedPara;
    } catch (err) {
      this.props.setToast(
        'Error parsing paragraphs, please make sure you have the correct permission.',
        'danger'
      );
      console.error(err);
      this.setState({ parsedPara: [] });
      return [];
    }
  };

  // Assigns Loading, Running & inQueue for paragraphs in current notebook
  showParagraphRunning = (param: number | string) => {
    let parsedPara = this.state.parsedPara;
    this.state.parsedPara.map((_: ParaType, index: number) => {
      if (param === 'queue') {
        parsedPara[index].inQueue = true;
        parsedPara[index].isOutputHidden = true;
      } else if (param === 'loading') {
        parsedPara[index].isRunning = true;
        parsedPara[index].isOutputHidden = true;
      } else if (param === index) {
        parsedPara[index].isRunning = true;
        parsedPara[index].isOutputHidden = true;
      }
    });
    this.setState({ parsedPara });
  };

  // Sets a paragraph to selected and deselects all others
  paragraphSelector = (index: number) => {
    let parsedPara = this.state.parsedPara;
    this.state.parsedPara.map((_: ParaType, idx: number) => {
      if (index === idx) parsedPara[idx].isSelected = true;
      else parsedPara[idx].isSelected = false;
    });
    this.setState({ parsedPara });
  };

  // Function for delete a Notebook button
  deleteParagraphButton = (para: ParaType, index: number) => {
    if (index !== -1) {
      return this.props.http
        .delete(`${NOTEBOOKS_API_PREFIX}/paragraph`, {
          query: {
            noteId: this.props.openedNoteId,
            paragraphId: para.uniqueId,
          },
        })
        .then((res) => {
          const paragraphs = [...this.state.paragraphs];
          paragraphs.splice(index, 1);
          const parsedPara = [...this.state.parsedPara];
          parsedPara.splice(index, 1);
          this.setState({ paragraphs, parsedPara });
        })
        .catch((err) => {
          this.props.setToast(
            'Error deleting paragraph, please make sure you have the correct permission.',
            'danger'
          );
          console.error(err.body.message);
        });
    }
  };

  showDeleteParaModal = (para: ParaType, index: number) => {
    this.setState({
      modalLayout: getDeleteModal(
        () => this.setState({ isModalVisible: false }),
        () => {
          this.deleteParagraphButton(para, index);
          this.setState({ isModalVisible: false });
        },
        'Delete paragraph',
        'Are you sure you want to delete the paragraph? The action cannot be undone.'
      ),
    });
    this.setState({ isModalVisible: true });
  };

  showDeleteAllParaModal = () => {
    this.setState({
      modalLayout: getDeleteModal(
        () => this.setState({ isModalVisible: false }),
        async () => {
          this.setState({ isModalVisible: false });
          await this.props.http
            .delete(`${NOTEBOOKS_API_PREFIX}/paragraph`, {
              query: {
                noteId: this.props.openedNoteId,
              },
            })
            .then((res) => {
              this.setState({ paragraphs: res.paragraphs });
              this.parseAllParagraphs();
              this.props.setToast('Paragraphs successfully deleted!');
            })
            .catch((err) => {
              this.props.setToast(
                'Error deleting paragraph, please make sure you have the correct permission.',
                'danger'
              );
              console.error(err.body.message);
            });
        },
        'Delete all paragraphs',
        'Are you sure you want to delete all paragraphs? The action cannot be undone.'
      ),
    });
    this.setState({ isModalVisible: true });
  };

  showClearOutputsModal = () => {
    this.setState({
      modalLayout: getDeleteModal(
        () => this.setState({ isModalVisible: false }),
        () => {
          this.clearParagraphButton();
          this.setState({ isModalVisible: false });
        },
        'Clear all outputs',
        'Are you sure you want to clear all outputs? The action cannot be undone.',
        'Clear'
      ),
    });
    this.setState({ isModalVisible: true });
  };

  showRenameModal = () => {
    this.setState({
      modalLayout: getCustomModal(
        (newName: string) => {
          this.props.renameNotebook(newName, this.props.openedNoteId);
          this.setState({ isModalVisible: false });
          this.loadNotebook();
        },
        () => this.setState({ isModalVisible: false }),
        'Name',
        'Rename investigation',
        'Cancel',
        'Rename',
        this.state.path,
        CREATE_NOTE_MESSAGE
      ),
    });
    this.setState({ isModalVisible: true });
  };

  showCloneModal = () => {
    this.setState({
      modalLayout: getCustomModal(
        (newName: string) => {
          this.props.cloneNotebook(newName, this.props.openedNoteId).then((id: string) => {
            setTimeout(() => {
              this.loadNotebook();
            }, 300);
          });
          this.setState({ isModalVisible: false });
        },
        () => this.setState({ isModalVisible: false }),
        'Name',
        'Duplicate investigation',
        'Cancel',
        'Duplicate',
        this.state.path + ' (copy)',
        CREATE_NOTE_MESSAGE
      ),
    });
    this.setState({ isModalVisible: true });
  };

  showDeleteNotebookModal = () => {
    this.setState({
      modalLayout: (
        <DeleteNotebookModal
          onConfirm={async () => {
            const toastMessage = `Investigation "${this.state.path}" successfully deleted!`;
            await this.props.deleteNotebook([this.props.openedNoteId], toastMessage);
            this.setState({ isModalVisible: false });
          }}
          onCancel={() => this.setState({ isModalVisible: false })}
          title={`Delete notebook "${this.state.path}"`}
          message="Delete investigation will remove all contents in the paragraphs."
        />
      ),
    });
    this.setState({ isModalVisible: true });
  };

  // Function for delete Visualization from notebook
  deleteVizualization = (uniqueId: string) => {
    this.props.http
      .delete(`${NOTEBOOKS_API_PREFIX}/paragraph/` + this.props.openedNoteId + '/' + uniqueId)
      .then((res) => {
        this.setState({ paragraphs: res.paragraphs });
        this.parseAllParagraphs();
      })
      .catch((err) => {
        this.props.setToast(
          'Error deleting visualization, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  // Backend call to add a paragraph, switch to "view both" if in output only view
  addPara = async (index: number, newParaContent: string, inpType: string) => {
    const addParaObj = {
      noteId: this.props.openedNoteId,
      paragraphIndex: index,
      paragraphInput: newParaContent,
      inputType: inpType,
    };
    if (this.props.openedNoteId.length === 0) {
      const noteId = await this.props.createNotebook(newParaContent.substring(5, 55));
      await this.props.setOpenedNoteId(noteId);
      addParaObj.noteId = noteId;
    }

    return this.props.http
      .post(`${NOTEBOOKS_API_PREFIX}/paragraph/`, {
        body: JSON.stringify(addParaObj),
      })
      .then((res) => {
        const paragraphs = [...this.state.paragraphs];
        paragraphs.splice(index, 0, res);
        const newPara = this.parseParagraphs([res])[0];
        newPara.isInputExpanded = true;
        const parsedPara = [...this.state.parsedPara];
        parsedPara.splice(index, 0, newPara);

        // this.paragraphSelector(index);
        // if (this.state.selectedViewId === 'output_only')
        //   this.setState({ selectedViewId: 'view_both' });
        return new Promise<ParaType>((resolve) => {
          this.setState({ paragraphs, parsedPara }, () => resolve(newPara));
        });
      })
      .catch((err) => {
        this.props.setToast(
          'Error adding paragraph, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  // Function to clone a paragraph
  cloneParaButton = (para: ParaType, index: number) => {
    let inputType = 'CODE';
    if (para.typeOut[0] === 'VISUALIZATION') {
      inputType = 'VISUALIZATION';
    }
    if (para.typeOut[0] === 'OBSERVABILITY_VISUALIZATION') {
      inputType = 'OBSERVABILITY_VISUALIZATION';
    }
    if (index !== -1) {
      return this.addPara(index, para.inp, inputType);
    }
  };

  // Function to move a paragraph
  movePara = (index: number, targetIndex: number) => {
    const paragraphs = [...this.state.paragraphs];
    paragraphs.splice(targetIndex, 0, paragraphs.splice(index, 1)[0]);
    const parsedPara = [...this.state.parsedPara];
    parsedPara.splice(targetIndex, 0, parsedPara.splice(index, 1)[0]);

    const moveParaObj = {
      noteId: this.props.openedNoteId,
      paragraphs,
    };

    return this.props.http
      .post(`${NOTEBOOKS_API_PREFIX}/set_paragraphs/`, {
        body: JSON.stringify(moveParaObj),
      })
      .then((res) => this.setState({ paragraphs, parsedPara }))
      .then((res) => this.scrollToPara(targetIndex))
      .catch((err) => {
        this.props.setToast(
          'Error moving paragraphs, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  scrollToPara(index: number) {
    setTimeout(() => {
      window.scrollTo({
        left: 0,
        top: this.state.parsedPara[index].paraDivRef.current?.offsetTop,
        behavior: 'smooth',
      });
    }, 0);
  }

  // Function for clearing outputs button
  clearParagraphButton = () => {
    this.showParagraphRunning('loading');
    const clearParaObj = {
      noteId: this.props.openedNoteId,
    };
    this.props.http
      .put(`${NOTEBOOKS_API_PREFIX}/paragraph/clearall/`, {
        body: JSON.stringify(clearParaObj),
      })
      .then((res) => {
        this.setState({ paragraphs: res.paragraphs });
        this.parseAllParagraphs();
      })
      .catch((err) => {
        this.props.setToast(
          'Error clearing paragraphs, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  // Backend call to update and run contents of paragraph
  updateRunParagraph = (
    para: ParaType,
    index: number,
    vizObjectInput?: string,
    paraType?: string
  ) => {
    this.showParagraphRunning(index);
    if (vizObjectInput) {
      para.inp = this.state.vizPrefix + vizObjectInput; // "%sh check"
    }

    const paraUpdateObject = {
      noteId: this.props.openedNoteId,
      paragraphId: para.uniqueId,
      paragraphInput: para.inp,
      paragraphType: paraType || '',
    };

    return this.props.http
      .post(`${NOTEBOOKS_API_PREFIX}/paragraph/update/run/`, {
        body: JSON.stringify(paraUpdateObject),
      })
      .then(async (res) => {
        if (res.output[0]?.outputType === 'QUERY') {
          await this.loadQueryResultsFromInput(res);
          const checkErrorJSON = JSON.parse(res.output[0].result);
          if (this.checkQueryOutputError(checkErrorJSON)) {
            return;
          }
        }
        const paragraphs = this.state.paragraphs;
        paragraphs[index] = res;
        const parsedPara = [...this.state.parsedPara];
        parsedPara[index] = this.parseParagraphs([res])[0];
        return new Promise((resolve) => this.setState({ paragraphs, parsedPara }, resolve));
      })
      .catch((err) => {
        if (err.body.statusCode === 413)
          this.props.setToast(`Error running paragraph: ${err.body.message}`, 'danger');
        else
          this.props.setToast(
            'Error running paragraph, please make sure you have the correct permission.',
            'danger'
          );
        console.error(err.body.message);
      });
  };

  checkQueryOutputError = (checkErrorJSON: JSON) => {
    // if query output has error output
    if (checkErrorJSON.hasOwnProperty('error')) {
      this.setState({
        showQueryParagraphError: true,
        queryParagraphErrorMessage: checkErrorJSON.error.reason,
      });
      return true;
    }
    // query ran successfully, reset error variables if currently set to true
    else if (this.state.showQueryParagraphError) {
      this.setState({
        showQueryParagraphError: false,
        queryParagraphErrorMessage: '',
      });
      return false;
    }
  };

  runForAllParagraphs = (reducer: (para: ParaType, index: number) => Promise<any>) => {
    return this.state.parsedPara
      .map((para: ParaType, index: number) => () => reducer(para, index))
      .reduce((chain, func) => chain.then(func), Promise.resolve());
  };

  // Handles text editor value and syncs with paragraph input
  textValueEditor = (evt: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
    if (!(evt.key === 'Enter' && evt.shiftKey)) {
      let parsedPara = this.state.parsedPara;
      parsedPara[index].inp = evt.target.value;
      this.setState({ parsedPara });
    }
  };

  // Handles run paragraph shortcut "Shift+Enter"
  handleKeyPress = (evt: React.KeyboardEvent<Element>, para: ParaType, index: number) => {
    if (evt.key === 'Enter' && evt.shiftKey) {
      this.updateRunParagraph(para, index);
    }
  };

  // update view mode, scrolls to paragraph and expands input if scrollToIndex is given
  updateView = (selectedViewId: string, scrollToIndex?: number) => {
    let parsedPara = [...this.state.parsedPara];
    this.state.parsedPara.map((para: ParaType, index: number) => {
      parsedPara[index].isInputExpanded = selectedViewId === 'input_only';
    });

    if (scrollToIndex !== undefined) {
      parsedPara[scrollToIndex].isInputExpanded = true;
      this.scrollToPara(scrollToIndex);
    }
    this.setState({ parsedPara, selectedViewId });
    this.paragraphSelector(scrollToIndex !== undefined ? scrollToIndex : -1);
  };

  loadNotebook = () => {
    this.showParagraphRunning('queue');
    this.props.http
      .get(`${NOTEBOOKS_API_PREFIX}/note/` + this.props.openedNoteId)
      .then(async (res) => {
        let index = 0;
        for (index = 0; index < res.paragraphs.length; ++index) {
          // if the paragraph is a query, load the query output
          if (res.paragraphs[index].output[0]?.outputType === 'QUERY') {
            await this.loadQueryResultsFromInput(res.paragraphs[index]);
          }
        }
        this.setState(res, this.parseAllParagraphs);
      })
      .catch((err) => {
        this.props.setOpenedNoteId('');
        console.error(err?.body?.message || err);
      });
  };

  loadQueryResultsFromInput = async (paragraph: any) => {
    const queryType =
      paragraph.input.inputText.substring(0, 4) === '%sql' ? 'sqlquery' : 'pplquery';
    await this.props.http
      .post(`/api/sql/${queryType}`, {
        body: JSON.stringify(paragraph.output[0].result),
      })
      .then((response) => {
        paragraph.output[0].result = response.data.resp;
        return paragraph;
      })
      .catch((err) => {
        this.props.setToast('Error getting query output', 'danger');
        console.error(err);
      });
  };

  setPara = (para: ParaType, index: number) => {
    const parsedPara = [...this.state.parsedPara];
    parsedPara.splice(index, 1, para);
    this.setState({ parsedPara });
  };

  componentDidMount() {
    if (this.props.openedNoteId.length > 0) {
      this.loadNotebook();
    }
  }

  componentDidUpdate(prevProps: NotebookProps, prevState: NotebookState) {
    if (prevProps.openedNoteId !== this.props.openedNoteId) {
      if (!this.props.openedNoteId) {
        this.setState({
          path: '',
          dateCreated: '',
          dateModified: '',
          paragraphs: [],
          parsedPara: [],
        });
      } else {
        this.loadNotebook();
      }
    }
  }

  render() {
    const createdText = (
      <div>
        <p>
          Created <br /> {moment(this.state.dateCreated).format(UI_DATE_FORMAT)}
        </p>
      </div>
    );
    const viewOptions: EuiButtonGroupOptionProps[] = [
      {
        id: 'view_both',
        label: 'View both',
      },
      {
        id: 'input_only',
        label: 'Input only',
      },
      {
        id: 'output_only',
        label: 'Output only',
      },
    ];
    const addParaPanels: EuiContextMenuPanelDescriptor[] = [
      {
        id: 0,
        title: 'Type',
        items: [
          {
            name: 'Code block',
            onClick: () => {
              this.setState({ isAddParaPopoverOpen: false });
              this.addPara(this.state.paragraphs.length, '', 'CODE');
            },
          },
          {
            name: 'Visualization',
            onClick: () => {
              this.setState({ isAddParaPopoverOpen: false });
              this.addPara(this.state.paragraphs.length, '', 'VISUALIZATION');
            },
          },
        ],
      },
    ];
    const paraActionsPanels: EuiContextMenuPanelDescriptor[] = [
      {
        id: 0,
        title: 'Actions',
        items: [
          {
            name: 'Add paragraph to top',
            panel: 1,
          },
          {
            name: 'Add paragraph to bottom',
            panel: 2,
          },
          {
            name: 'Run all paragraphs',
            disabled: this.state.parsedPara.length === 0,
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.runForAllParagraphs((para: ParaType, index: number) => {
                return para.paraRef.current?.runParagraph();
              });
              if (this.state.selectedViewId === 'input_only') {
                this.updateView('view_both');
              }
            },
          },
          {
            name: 'Clear all outputs',
            disabled: this.state.parsedPara.length === 0,
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.showClearOutputsModal();
            },
          },
          {
            name: 'Delete all paragraphs',
            disabled: this.state.parsedPara.length === 0,
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.showDeleteAllParaModal();
            },
          },
        ],
      },
      {
        id: 1,
        title: 'Add to top',
        items: [
          {
            name: 'Code block',
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.addPara(0, '', 'CODE');
            },
          },
          {
            name: 'Visualization',
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.addPara(0, '', 'VISUALIZATION');
            },
          },
        ],
      },
      {
        id: 2,
        title: 'Add to bottom',
        items: [
          {
            name: 'Code block',
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.addPara(this.state.paragraphs.length, '', 'CODE');
            },
          },
          {
            name: 'Visualization',
            onClick: () => {
              this.setState({ isParaActionsPopoverOpen: false });
              this.addPara(this.state.paragraphs.length, '', 'VISUALIZATION');
            },
          },
        ],
      },
    ];
    const noteActionsPanels: EuiContextMenuPanelDescriptor[] = [
      {
        id: 0,
        title: 'Investigation actions',
        items: [
          {
            name: 'Rename investigation',
            onClick: () => {
              this.setState({ isNoteActionsPopoverOpen: false });
              this.showRenameModal();
            },
          },
          {
            name: 'Duplicate investigation',
            onClick: () => {
              this.setState({ isNoteActionsPopoverOpen: false });
              this.showCloneModal();
            },
          },
          {
            name: 'Delete investigation',
            onClick: () => {
              this.setState({ isNoteActionsPopoverOpen: false });
              this.showDeleteNotebookModal();
            },
          },
        ],
      },
    ];

    return (
      <>
        <EuiPage className="investigations-glass">
          <EuiPageBody component="div">
            {/* <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiText>{createdText}</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  panelPaddingSize="none"
                  withTitle
                  button={
                    <EuiButton
                      data-test-subj="investigation-investigation-actions-button"
                      iconType="arrowDown"
                      iconSide="right"
                      onClick={() => this.setState({ isNoteActionsPopoverOpen: true })}
                    >
                      Investigation actions
                    </EuiButton>
                  }
                  isOpen={this.state.isNoteActionsPopoverOpen}
                  closePopover={() => this.setState({ isNoteActionsPopoverOpen: false })}
                >
                  <EuiContextMenu initialPanelId={0} panels={noteActionsPanels} />
                </EuiPopover>
              </EuiFlexItem>
            </EuiFlexGroup> */}

            <>
              {this.state.parsedPara.map((para: ParaType, index: number) => (
                <div
                  ref={this.state.parsedPara[index].paraDivRef}
                  key={`para_div_${para.uniqueId}`}
                >
                  <Paragraphs
                    ref={this.state.parsedPara[index].paraRef}
                    pplService={this.props.pplService}
                    para={para}
                    setPara={(para: ParaType) => this.setPara(para, index)}
                    dateModified={this.state.paragraphs[index]?.dateModified}
                    index={index}
                    paraCount={this.state.parsedPara.length}
                    paragraphSelector={this.paragraphSelector}
                    textValueEditor={this.textValueEditor}
                    handleKeyPress={this.handleKeyPress}
                    addPara={this.addPara}
                    DashboardContainerByValueRenderer={this.props.DashboardContainerByValueRenderer}
                    deleteVizualization={this.deleteVizualization}
                    http={this.props.http}
                    selectedViewId={this.state.selectedViewId}
                    setSelectedViewId={this.updateView}
                    deletePara={this.showDeleteParaModal}
                    runPara={this.updateRunParagraph}
                    clonePara={this.cloneParaButton}
                    movePara={this.movePara}
                    showQueryParagraphError={this.state.showQueryParagraphError}
                    queryParagraphErrorMessage={this.state.queryParagraphErrorMessage}
                  />
                </div>
              ))}
              <EuiHorizontalRule />
              <UserInput
                addPara={async (newParaContent: string) => {
                  const newParaIndex = this.state.paragraphs.length;
                  const newPara = await this.addPara(newParaIndex, newParaContent, 'CODE');
                  if (newPara) {
                    await this.updateRunParagraph(newPara, newParaIndex);
                    setTimeout(() => {
                      // TODO scroll to bottom
                    }, 0);
                  }
                }}
                openNew={() => this.props.setOpenedNoteId('')}
              />
            </>
          </EuiPageBody>
        </EuiPage>
        {this.state.isModalVisible && this.state.modalLayout}
      </>
    );
  }
}
