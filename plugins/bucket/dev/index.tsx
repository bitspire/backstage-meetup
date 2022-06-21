import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { bucketPlugin, BucketPage } from '../src/plugin';

createDevApp()
  .registerPlugin(bucketPlugin)
  .addPage({
    element: <BucketPage />,
    title: 'Root Page',
    path: '/bucket',
  })
  .render();
