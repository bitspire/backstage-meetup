import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn, Progress, TableFilter } from '@backstage/core-components';
import { OpenInNew } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { configApiRef, useApi } from '@backstage/core-plugin-api';


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
  name: string;
  alerts: any[];
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
        title: 'Runbook-URL',
        field: 'runbook_url',
      },
      {
        title: 'Summary',
        field: 'summary',
      },
    ];

    const filters: TableFilter[] = [
      {
        column: 'Cluster',
        type: 'select',
      },
    {
        column: 'Severity',
        type: 'multiple-select',
      },
    ];
    const data = alertManagers.map( alert => {
        return {
          cluster: alert.name,
          alertname: alert.name,
          severity: alert.name,
          state: alert.name,
          runbook_url: (<OpenInNew/>),
          summary: alert.name
        };
      })
  

    return (
          <div className={classes.container}>
            <Table
              options={{ paging: false, padding: 'dense' }}
              data={data}
              columns={columns}
              filters={filters}
            />
          </div>
        );

  }


export const AlertFetchComponent = () => {
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const { value, loading, error } = useAsync(async (): Promise<Alerts[]> => {
    const response = await fetch(`${backendUrl}/api/alertmanager`);
    const data = await response.json();
console.log(data)
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }


return <FilterTable alertManagers={value || []}/>
};
