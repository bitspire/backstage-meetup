import React, { useState } from 'react';
import {
  Page,
  Table,
  TableColumn,
  Progress,
  TableFilter,
  CodeSnippet,
  ContentHeader,
  Button,
  SupportButton,
  TableProps,
  CopyTextButton,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {
  useApi,
  identityApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputLabel,
} from '@material-ui/core';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import Close from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { Content } from '@backstage/core-components';
import 'style-loader!css-loader!sass-loader!../../styles/buckets-styles.scss';
import { useNavigate } from 'react-router';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { DenseTableProps, BucketValues, bucketDetailsType } from '../../types';

export const DenseTable = ({
  bucketList,
  onDeleteButton,
  inProgressCheck,
}: DenseTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [getBucketName, setBucketName] = useState('');
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showSecretAccessKey, setShoweSecretAccessKey] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<bucketDetailsType>({
    bucketName: '',
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
  });
  const navigate = useNavigate();
  const handleOpenDelete = (item: BucketValues) => {
    setOpen(true);
    setSelectedItem(item);
    setBucketName(item?.name);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDelete = () => {
    onDeleteButton(selectedItem as BucketValues);
    setOpen(false);
  };
  const columns: TableColumn<BucketValues>[] = [
    { title: 'name', field: 'name', highlight: true },
    {
      title: 'Max Size',
      field: 'maxSize',
      align: 'center',
      cellStyle: { paddingRight: 50 },
    },
    {
      title: 'Max Objects',
      field: 'maxObjects',
      align: 'center',
      cellStyle: { paddingRight: 50 },
    },
    {
      title: 'Status',
      field: 'status',
      align: 'center',
      cellStyle: { paddingRight: 40 },
    },
  ];

  const data = bucketList.map((bucket: BucketValues) => {
    return {
      name: bucket?.name,
      status: bucket?.status,
      maxSize: bucket?.maxSize,
      maxObjects: bucket?.maxObjects,
      connect: bucket?.connect,
    };
  });
  const useStyles = makeStyles(theme => ({
    container: {
      width: '100%',
    },
    empty: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
  }));
  const filters: TableFilter[] = [
    {
      column: 'Status',
      type: 'select',
    },
    {
      column: 'Max Size',
      type: 'select',
    },
    {
      column: 'Max Objects',
      type: 'select',
    },
  ];
  const actions: TableProps<BucketValues>['actions'] = [
    bucket => {
      return {
        icon: () => <OpenInNew aria-label="Conncet" fontSize="small" />,
        tooltip: 'Connect',
        disabled: !bucket.connect,
        onClick: () => {
          setOpenDetails(true);
          setSelectedBucket(bucket.connect);
          setBucketName(bucket.name);
        },
      };
    },
    bucket => {
      return {
        icon: () => <Edit aria-label="Edit" fontSize="small" />,
        tooltip: 'Edit',
        disabled: !bucket.name,
        onClick: () => {
          if (!bucket.name) return;
          navigate(`/bucket/${bucket.name}`, { state: bucket });
        },
      };
    },
    bucket => {
      return {
        cellStyle: { paddingLeft: '1em' },
        icon: () => <Delete aria-label="Delete" fontSize="small" />,
        tooltip: 'Delete',
        onClick: () => handleOpenDelete(bucket),
      };
    },
  ];


  const classes = useStyles();

  return (
    <Grid className={classes.container}>
      {inProgressCheck ? <Progress /> : null}
      <Table
        options={{
          paging: false,
          actionsColumnIndex: -1,
          padding: 'dense',
        }}
        columns={columns}
        data={data}
        filters={filters}
        actions={actions}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Bucket</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this bucket {getBucketName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} to="">
            Cancel
          </Button>
          <Button onClick={handleDelete} to="">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Bucket Credentials</DialogTitle>
        <DialogContent>
          <InputLabel style={{ marginTop: 15 }}>
            Bucket Name
          </InputLabel>
          <OutlinedInput style={{ marginTop: 5, width: '100%' }}
            type='text'
            value={selectedBucket.bucketName}
            readOnly
            endAdornment={
              <InputAdornment position="end">
                <CopyTextButton
                  text={selectedBucket.bucketName}
                  tooltipText="Coiped"
                  tooltipDelay={3000}
                />
              </InputAdornment>
            }
          />
          <InputLabel style={{ marginTop: 15 }}>
            Access Key
          </InputLabel>
          <OutlinedInput style={{ marginTop: 5, width: '100%' }}
            type={showAccessKey ? 'text' : 'password'}
            value={selectedBucket.AWS_ACCESS_KEY_ID}
            readOnly
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle access key visibility"
                  onClick={() => setShowAccessKey(!showAccessKey)}
                  edge="end"
                >
                  {showAccessKey ? <Visibility /> : <VisibilityOff />}
                </IconButton>
                <CopyTextButton
                  text={selectedBucket.AWS_ACCESS_KEY_ID}
                  tooltipText="Coiped"
                  tooltipDelay={3000}
                />
              </InputAdornment>
            }
          />
          <InputLabel style={{ marginTop: 15 }}>Secret Access Key</InputLabel>
          <OutlinedInput style={{ marginTop: 5, width: '100%' }}
            type={showSecretAccessKey ? 'text' : 'password'}
            value={selectedBucket.AWS_SECRET_ACCESS_KEY}
            readOnly
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle access key visibility"
                  onClick={() => setShoweSecretAccessKey(!showSecretAccessKey)}
                  edge="end"
                >
                  {showSecretAccessKey ? <Visibility /> : <VisibilityOff />}
                </IconButton>
                <CopyTextButton
                  text={selectedBucket.AWS_SECRET_ACCESS_KEY}
                  tooltipText="Coiped"
                  tooltipDelay={3000}
                />
              </InputAdornment>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)} to="">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export const BucketFetchComponent = () => {
  const [getAllBucketList, setAllBucketList] = useState<BucketValues | {}>([]);
  const [inProgress, setInProgress] = useState(false);
  const [getCheckBucketData, setCheckBucketData] = useState('');
  const [alertCheck, setAlertCheck] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [onError, setOnError] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const identityApi = useApi(identityApiRef);
  identityApi.getProfileInfo().then(profile => {
    setUsername(
      profile.displayName?.toLocaleLowerCase().replace(' ', '-') || '',
    );
  });
  const discoveryApi = useApi(discoveryApiRef);

  const backendUrl = discoveryApi.getBaseUrl('bucket');

  const getAllBuckets = async () => {
    setInProgress(true);
    try {
      const response = await fetch(`${await backendUrl}/`);
      const data = await response.json();
      if (data) {
        if (data.count !== 0 && data.count !== undefined) {
          setAllBucketList(data.instances);
        } else {
          setAllBucketList([]);
        }
        setInProgress(false);
      }
    } catch (_) {
      setInProgress(false);
      setOnError(true);
      setAlertMessage('Error!');
    }
  };

  const { loading, error } = useAsync(async (): Promise<BucketValues[]> => {
    if (username !== '') {
      getAllBuckets();
    }
    return [];
  }, [username]);


  const deleteBucket = async (bucket: BucketValues) => {
    setInProgress(true);
    try {
      const response = await fetch(
        `${await backendUrl}/${username}-bucket-${bucket.name}`,
        {
          method: 'DELETE',
        },
      );
      const data = await response.json();
      if (data) {
        setAlertCheck(true);
        setAlertMessage('Deleted Successfully!');
        setInProgress(false);
        getAllBuckets();
      }
    } catch (_) {
      setInProgress(false);
      setOnError(true);
      setAlertMessage('Error, Not deleted!');
    }
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Page themeId="tool">
      <Content>
        <Collapse in={alertCheck}>
          <Alert
            severity={onError ? 'error' : 'success'}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlertCheck(false);
                  setOnError(false);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
        {getCheckBucketData ? (
          <Grid>
            <Button
              variant="outlined"
              onClick={() => setCheckBucketData('')}
              to=""
              className="cancel-button"
            >
              Cancel
            </Button>
            <Grid>
              <CodeSnippet
                text={getCheckBucketData}
                language="javascript"
                showCopyCodeButton
              />
            </Grid>
          </Grid>
        ) : (
          <Grid>
            <ContentHeader title="Bucket">
              <Grid className="create-cancel-div">
                <Button
                  data-test-id="create-btn"
                  to="./create"
                  color="primary"
                  variant="contained"
                >
                  Create
                </Button>
                <SupportButton />
              </Grid>
            </ContentHeader>
            <DenseTable
              bucketList={getAllBucketList as any}
              onDeleteButton={bucket => deleteBucket(bucket)}
              inProgressCheck={inProgress}
            />
          </Grid>
        )}
      </Content>
    </Page>
  );
};
