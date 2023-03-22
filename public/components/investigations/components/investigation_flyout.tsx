/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable no-console */

import {
  EuiButtonIcon,
  EuiFlyout,
  EuiFlyoutBody,
  EuiGlobalToastList,
  EuiLink,
  EuiPanel,
} from '@elastic/eui';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import React, { ReactChild } from 'react';
import { ChromeBreadcrumb, CoreStart } from '../../../../../../src/core/public';
import { DashboardStart } from '../../../../../../src/plugins/dashboard/public';
import {
  NOTEBOOKS_API_PREFIX,
  NOTEBOOKS_DOCUMENTATION_URL,
} from '../../../../common/constants/notebooks';
import PPLService from '../../../services/requests/ppl';
import { InvestigationTabs } from './investigation_tabs';

/*
 * "InvestigationFlyout" component renders the whole Investigations as a single page application
 *
 * Props taken in as params are:
 * DashboardContainerByValueRenderer: Dashboard container renderer for visualization
 * http object: for making API requests
 *
 * Cell component of nteract used as a container for paragraphs in notebook UI.
 * https://components.nteract.io/#cell
 */

type InvestigationFlyoutProps = {
  DashboardContainerByValueRenderer: DashboardStart['DashboardContainerByValueRenderer'];
  http: CoreStart['http'];
  pplService: PPLService;
  notifications: CoreStart['notifications'];
  parentBreadcrumb: ChromeBreadcrumb;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
};

interface InvestigationFlyoutState {
  data: NotebookType[];
  openedNotebook: NotebookType | undefined;
  toasts: Toast[];
  loading: boolean;
  flyoutOpen: boolean;
  openedNoteId: string;
}

export interface NotebookType {
  path: string;
  id: string;
  dateCreated: string;
  dateModified: string;
}

export class InvestigationFlyout extends React.Component<
  InvestigationFlyoutProps,
  InvestigationFlyoutState
> {
  constructor(props: Readonly<InvestigationFlyoutProps>) {
    super(props);
    this.state = {
      data: [],
      openedNotebook: undefined,
      toasts: [],
      loading: false,
      flyoutOpen: false,
      openedNoteId: '',
    };
  }

  setToast = (title: string, color = 'success', text?: ReactChild) => {
    if (!text) text = '';
    this.setState((prevState) => ({
      toasts: [
        ...prevState.toasts,
        {
          id: new Date().toISOString(),
          title,
          text,
          color,
        } as Toast,
      ],
    }));
  };

  // Fetches path and id for all stored notebooks
  fetchNotebooks = () => {
    return this.props.http
      .get(`${NOTEBOOKS_API_PREFIX}/`)
      .then((res) => this.setState(res))
      .catch((err) => {
        console.error('Issue in fetching the investigations', err.body.message);
      });
  };

  // Creates a new notebook, returns notebook id
  createNotebook = (newNoteName: string) => {
    if (newNoteName.length >= 50 || newNoteName.length === 0) {
      this.setToast('Invalid investigation name', 'danger');
      window.location.assign('#/investigations');
      return;
    }
    const newNoteObject = {
      name: newNoteName,
    };

    return this.props.http
      .post(`${NOTEBOOKS_API_PREFIX}/note`, {
        body: JSON.stringify(newNoteObject),
      })
      .catch((err) => {
        this.setToast(
          'Please ask your administrator to enable Investigations for you.',
          'danger',
          <EuiLink href={NOTEBOOKS_DOCUMENTATION_URL} target="_blank">
            Documentation
          </EuiLink>
        );
        console.error(err);
      });
  };

  // Renames an existing notebook
  renameNotebook = (editedNoteName: string, editedNoteID: string) => {
    if (editedNoteName.length >= 50 || editedNoteName.length === 0) {
      this.setToast('Invalid investigation name', 'danger');
      return;
    }
    const renameNoteObject = {
      name: editedNoteName,
      noteId: editedNoteID,
    };

    return this.props.http
      .put(`${NOTEBOOKS_API_PREFIX}/note/rename`, {
        body: JSON.stringify(renameNoteObject),
      })
      .then((res) => {
        this.setState((prevState) => {
          const newData = [...prevState.data];
          const renamedNotebook = newData.find((notebook) => notebook.id === editedNoteID);
          if (renamedNotebook) renamedNotebook.path = editedNoteName;
          return { data: newData };
        });
        this.setToast(`Investigation successfully renamed into "${editedNoteName}"`);
      })
      .catch((err) => {
        this.setToast(
          'Error renaming investigation, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  // Clones an existing notebook, return new notebook's id
  cloneNotebook = (clonedNoteName: string, clonedNoteID: string): Promise<string> => {
    if (clonedNoteName.length >= 50 || clonedNoteName.length === 0) {
      this.setToast('Invalid investigation name', 'danger');
      return Promise.reject();
    }
    const cloneNoteObject = {
      name: clonedNoteName,
      noteId: clonedNoteID,
    };

    return this.props.http
      .post(`${NOTEBOOKS_API_PREFIX}/note/clone`, {
        body: JSON.stringify(cloneNoteObject),
      })
      .then((res) => {
        this.setState((prevState) => ({
          data: [
            ...prevState.data,
            {
              path: clonedNoteName,
              id: res.body.id,
              dateCreated: res.body.dateCreated,
              dateModified: res.body.dateModified,
            },
          ],
        }));
        this.setToast(`Investigation "${clonedNoteName}" successfully created!`);
        return res.body.id;
      })
      .catch((err) => {
        this.setToast(
          'Error cloning investigation, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  // Deletes existing notebooks
  deleteNotebook = (notebookList: string[], toastMessage?: string) => {
    return this.props.http
      .delete(`${NOTEBOOKS_API_PREFIX}/note/${notebookList.join(',')}`)
      .then((res) => {
        this.setState((prevState) => ({
          data: prevState.data.filter((notebook) => !notebookList.includes(notebook.id)),
        }));
        const message =
          toastMessage ||
          `Investigation${notebookList.length > 1 ? 's' : ''} successfully deleted!`;
        this.setToast(message);
        return res;
      })
      .catch((err) => {
        this.setToast(
          'Error deleting investigation, please make sure you have the correct permission.',
          'danger'
        );
        console.error(err.body.message);
      });
  };

  addSampleNotebooks = async () => {
    try {
      this.setState({ loading: true });
      const flights = await this.props.http
        .get('../api/saved_objects/_find', {
          query: {
            type: 'index-pattern',
            search_fields: 'title',
            search: 'opensearch_dashboards_sample_data_flights',
          },
        })
        .then((resp) => resp.total === 0);
      const logs = await this.props.http
        .get('../api/saved_objects/_find', {
          query: {
            type: 'index-pattern',
            search_fields: 'title',
            search: 'opensearch_dashboards_sample_data_logs',
          },
        })
        .then((resp) => resp.total === 0);
      if (flights || logs) this.setToast('Adding sample data. This can take some time.');
      await Promise.all([
        flights ? this.props.http.post('../api/sample_data/flights') : Promise.resolve(),
        logs ? this.props.http.post('../api/sample_data/logs') : Promise.resolve(),
      ]);
      const visIds: string[] = [];
      await this.props.http
        .get('../api/saved_objects/_find', {
          query: {
            type: 'visualization',
            search_fields: 'title',
            search: '[Logs] Response Codes Over Time + Annotations',
          },
        })
        .then((resp) => visIds.push(resp.saved_objects[0].id));
      await this.props.http
        .get('../api/saved_objects/_find', {
          query: {
            type: 'visualization',
            search_fields: 'title',
            search: '[Logs] Unique Visitors vs. Average Bytes',
          },
        })
        .then((resp) => visIds.push(resp.saved_objects[0].id));
      await this.props.http
        .get('../api/saved_objects/_find', {
          query: {
            type: 'visualization',
            search_fields: 'title',
            search: '[Flights] Flight Count and Average Ticket Price',
          },
        })
        .then((resp) => visIds.push(resp.saved_objects[0].id));
      await this.props.http
        .post(`${NOTEBOOKS_API_PREFIX}/note/addSampleNotebooks`, {
          body: JSON.stringify({ visIds }),
        })
        .then((res) => {
          const newData = res.body.map((notebook: any) => ({
            path: notebook.name,
            id: notebook.id,
            dateCreated: notebook.dateCreated,
            dateModified: notebook.dateModified,
          }));
          this.setState((prevState) => ({
            data: [...prevState.data, ...newData],
          }));
        });
      this.setToast(`Sample notebooks successfully added.`);
    } catch (err: any) {
      this.setToast('Error adding sample investigations.', 'danger');
      console.error(err.body.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  setOpenedNoteId = (openedNoteId: string) => {
    return new Promise<void>((resolve) => this.setState({ openedNoteId }, resolve));
  };

  componentDidMount() {
    this.fetchNotebooks();
  }

  render() {
    const toasts = (
      <EuiGlobalToastList
        toasts={this.state.toasts}
        dismissToast={(removedToast) => {
          this.setState({
            toasts: this.state.toasts.filter((toast) => toast.id !== removedToast.id),
          });
        }}
        toastLifeTimeMs={6000}
      />
    );

    if (!this.state.flyoutOpen) {
      return (
        <>
          {toasts}
          <EuiButtonIcon
            iconType="faceHappy"
            iconSize="l"
            display="empty"
            color="primary"
            id="investigations-toggle-icon"
            onClick={() => this.setState({ flyoutOpen: true })}
          />
        </>
      );
    }

    return (
      <>
        {toasts}
        <EuiFlyout
          ownFocus={false}
          onClose={() => {
            this.setState({ flyoutOpen: false });
          }}
          className="investigations-glass-wrapper"
        >
          <EuiFlyoutBody>
            <EuiPanel id="investigations-panel" paddingSize="none">
              <InvestigationTabs
                pplService={this.props.pplService}
                openedNoteId={this.state.openedNoteId}
                setOpenedNoteId={this.setOpenedNoteId}
                DashboardContainerByValueRenderer={this.props.DashboardContainerByValueRenderer}
                http={this.props.http}
                createNotebook={this.createNotebook}
                renameNotebook={this.renameNotebook}
                cloneNotebook={this.cloneNotebook}
                deleteNotebook={this.deleteNotebook}
                setToast={this.setToast}
                loading={this.state.loading}
                fetchNotebooks={this.fetchNotebooks}
                notebooks={this.state.data}
              />
            </EuiPanel>
          </EuiFlyoutBody>
        </EuiFlyout>
      </>
    );
  }
}
