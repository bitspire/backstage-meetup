import React, { useState, useEffect } from 'react';
import {
  Page,
  Content,
  ContentHeader,
  Button,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import {
  useApi,
  identityApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import 'style-loader!css-loader!sass-loader!../../styles/buckets-styles.scss';
import { TextField, Grid } from '@material-ui/core';
import { useNavigate, useLocation } from 'react-router';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type BucketValues = {
  name: string;
  status: string;
  maxSize: string;
  maxObjects: string;
  connect: string;
};

export const BucketEditComponent = () => {
  const [bucketName, setBucketName] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');
  const [maxObjects, setMaxObjects] = useState<string>('');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [onCreateHasError, setOnCreateHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const identityApi = useApi(identityApiRef);
  identityApi.getProfileInfo().then(profile => {
    setEmail(profile.email || '');
    setUsername(
      profile.displayName?.toLocaleLowerCase().replace(' ', '-') || '',
    );
  });
  const discoveryApi = useApi(discoveryApiRef);
  const backendUrl = discoveryApi.getBaseUrl('bucket');

  const updateBucket = async () => {
    setInProgress(true);
    const bucketObj = {
      email: email,
      name: bucketName,
      maxSize: maxSize ? maxSize : '5G',
      maxObjects: maxObjects ? maxObjects : '10',
      status: 'updated',
    };
    try {
      const response = await fetch(
        `${await backendUrl}/${username}-bucket-${bucketName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bucketObj),
        },
      );
      const data = await response.json();
      if (data) {
        setInProgress(false);
        navigate('/bucket');
      }
    } catch (error: any) {
      setOnCreateHasError(true);
      setErrorMessage(error);
      setInProgress(false);
    }
  };
  useEffect(() => {
    const bucketData = state as BucketValues;
    setBucketName(bucketData?.name);
    setMaxSize(bucketData?.maxSize);
    setMaxObjects(bucketData?.maxObjects);
  }, [state]);

  return (
    <Page themeId="tool">
      <Content>
        <Collapse in={onCreateHasError}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOnCreateHasError(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Alert>
        </Collapse>
        <ContentHeader title="Update Bucket">
          <Grid className="create-cancel-div">
            <Button
              data-test-id="create-btn"
              to=""
              color="primary"
              variant="contained"
              onClick={() => updateBucket()}
              disabled={maxSize && maxObjects ? false : true}
              style={{ marginRight: 15 }}
            >
              Save
            </Button>
            <Button to="/bucket" color="primary" variant="outlined">
              Cancel
            </Button>
            <SupportButton />
          </Grid>
        </ContentHeader>
        {inProgress ? <Progress /> : null}
        <Grid container spacing={3} direction="column">
          <Grid item>
            <Grid className="div-db-main">
              <Grid className="text-field-input">
                <Grid className="custom-input">
                  <TextField
                    style={{ width: '100%' }}
                    type="text"
                    variant="outlined"
                    placeholder="bucket-name"
                    label="Bucket Name"
                    required
                    disabled
                    value={bucketName}
                    helperText="Enter the Bucket Name."
                    onChange={event => setBucketName(event.target.value)}
                  />
                </Grid>
                <Grid>
                  <Grid className="custom-input-div">
                    <TextField
                      type="number"
                      variant="outlined"
                      placeholder="5"
                      label="Max Size"
                      value={maxSize}
                      helperText="Enter the Max Size."
                      onChange={event => setMaxSize(event.target.value)}
                      style={{ width: '100%', marginTop: 15 }}
                    />
                    <Grid className="second-input-label">
                      <text className="second-input-label-text">G</text>
                    </Grid>
                  </Grid>
                  <Grid>
                    <TextField
                      style={{ width: '100%', marginTop: 15 }}
                      type="number"
                      variant="outlined"
                      placeholder="10"
                      label="Max Objects"
                      value={maxObjects}
                      helperText="Enter the Max Objects."
                      onChange={event => setMaxObjects(event.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
