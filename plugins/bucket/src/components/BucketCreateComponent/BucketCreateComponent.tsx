import React, { useState } from 'react';
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
import MaterialButton from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { useNavigate } from 'react-router';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export const BucketCreateComponent = () => {
  const [bucketName, setBucketName] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');
  const [maxObjects, setMaxObjects] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [onCreateHasError, setOnCreateHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const identityApi = useApi(identityApiRef);
  identityApi.getProfileInfo().then(profile => {
    setEmail(profile.email || '');
    setUsername(
      profile.displayName?.toLocaleLowerCase().replace(' ', '-') || '',
    );
  });
  const discoveryApi = useApi(discoveryApiRef);
  const backendUrl = discoveryApi.getBaseUrl('bucket');

  const createBucket = async () => {
    setInProgress(true);
    const bucketObj = {
      email: email,
      name: bucketName,
      maxSize: maxSize ? maxSize : '5G',
      maxObjects: maxObjects ? maxObjects : '10',
      status: 'created',
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
        <ContentHeader title="Create Bucket">
          <Grid className="create-cancel-div">
            <Button
              data-test-id="create-btn"
              to=""
              color="primary"
              variant="contained"
              onClick={() => createBucket()}
              disabled={bucketName !== '' ? false : true}
              style={{ marginRight: 15 }}
            >
              Create
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
                    helperText="Enter the Bucket Name."
                    onChange={event => setBucketName(event.target.value)}
                  />
                </Grid>
                <Grid className="advanced-button">
                  <MaterialButton
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="add-button"
                    color="inherit"
                    endIcon={
                      !showAdvanced ? (
                        <ArrowDropDownIcon fontSize="large" />
                      ) : (
                        <ArrowDropUpIcon fontSize="large" />
                      )
                    }
                  >
                    <Grid className="card-header-button-div">
                      <text className="custom-row-div-text">Advanced</text>
                    </Grid>
                  </MaterialButton>
                </Grid>
                {showAdvanced ? (
                  <Grid>
                    <Grid className="custom-input-div">
                      <TextField
                        type="number"
                        variant="outlined"
                        placeholder="5"
                        label="Max Size"
                        onChange={event => setMaxSize(`${event.target.value}G`)}
                        style={{ width: '100%' }}
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
                        onChange={event => setMaxObjects(event.target.value)}
                      />
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
