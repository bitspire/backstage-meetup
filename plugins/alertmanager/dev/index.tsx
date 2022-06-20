import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { alertmanagerPlugin, AlertmanagerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(alertmanagerPlugin)
  .addPage({
    element: <AlertmanagerPage />,
    title: 'Root Page',
    path: '/alertmanager'
  })
  .render();
