import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { AlertFetchComponent } from '../AlertFetchComponent';

export const AlertsComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to Alertmanager!" subtitle="">
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Alertmanger">
        <SupportButton>A description of your plugin goes here.</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        {/* <Grid item>
          <InfoCard title="Information card">
            <Typography variant="body1">
             Alerts will show up below
            </Typography>
          </InfoCard>
        </Grid> */}
        <Grid item>
          <AlertFetchComponent />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
