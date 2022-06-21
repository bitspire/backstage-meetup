import React from 'react';
import { Header, Page, Content } from '@backstage/core-components';
import { BucketFetchComponent } from '../BucketFetchComponent';
import { BucketCreateComponent } from '../BucketCreateComponent';
import { BucketEditComponent } from '../BucketEditComponent';
import { Routes, Route } from 'react-router';

export const BucketComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to bucket!" />
    <Content>
      <Routes>
        <Route path="/" element={<BucketFetchComponent />} />
        <Route path="/create" element={<BucketCreateComponent />} />
        <Route path="/:name" element={<BucketEditComponent />} />
      </Routes>
    </Content>
  </Page>
);
