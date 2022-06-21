import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn, Progress, TableFilter } from '@backstage/core-components';
import { OpenInNew } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { StatusWarning, StatusAborted, StatusError } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
  container: {
    width: "100%",
  },
  empty: {
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
  }
}));
type Alerts = {
  cluster: string,
  alertname: string,
  severity: string,
  state: string,
  runbook_url: string,
  summary: string,

}


type DenseTableProps = {
  alertManagers: Alerts[];
};

export const FilterTable = ({ alertManagers }: DenseTableProps) => {
  const classes = useStyles();
  const columns: TableColumn[] = [
    {
      title: 'Cluster',
      field: 'cluster',
      highlight: true,
    },
    {
      title: 'Alertname',
      field: 'alertname',
      highlight: true,
    },
    {
      title: 'Severity',
      field: 'severity',
    },
    {
      title: 'State',
      field: 'state',

    },
    {
      title: 'Summary',
      field: 'summary',
    },
  ];

  const filters: TableFilter[] = [
    {
      column: 'Cluster',
      type: 'multiple-select',
    },
    {
      column: 'Alertname',
      type: 'multiple-select',
    },
  ];
  const data = alertManagers.map(alert => {
    if (alert.severity === "none") {
      return {
        cluster: alert.cluster,
        alertname: alert.alertname,

        severity: <StatusAborted>None</StatusAborted>,
        state: alert.state,
        runbook_url: alert.runbook_url,
        summary: alert.summary
      }
    }
    else if (alert.severity === "warning") {

      return {
        cluster: alert.cluster,
        alertname: alert.alertname,
        severity: <StatusWarning> Warning</StatusWarning>,
        state: alert.state,
        runbook_url: alert.runbook_url,
        summary: alert.summary
      }
    }
    else if (alert.severity === "critical") {
      return {
        cluster: alert.cluster,
        alertname: alert.alertname,
        severity: <StatusError>Critical</StatusError>,
        state: alert.state,
        runbook_url: alert.runbook_url,
        summary: alert.summary
      }
    }
  })


  return (
    <div className={classes.container}>
      <Table
        options={{ paging: false, padding: 'dense', actionsColumnIndex: -1 }}
        data={data}
        actions={actions}
        columns={columns}
        filters={filters}
      />
    </div>
  );

}
const actions: TableProps<Alerts>['actions'] = [
  ({ runbook_url }) => {
    return {
      icon: () => <OpenInNew aria-label="View" />,
      tooltip: 'Runbook',
      disabled: !runbook_url,
      onClick: () => {
        if (!runbook_url) return;
        window.open(runbook_url, '_blank');
      },
    };
  },

];



export const AlertFetchComponent = () => {
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const { value, loading, error } = useAsync(async (): Promise<Alerts[]> => {
    const response = await fetch(`${backendUrl}/api/alertmanager`);
    const data = await response.json();

    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }


  return <FilterTable alertManagers={value || []} />
};
