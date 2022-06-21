import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const alertmanagerPlugin = createPlugin({
  id: 'alertmanager',
  routes: {
    root: rootRouteRef,
  },
});

export const AlertmanagerPage = alertmanagerPlugin.provide(
  createRoutableExtension({
    name: 'AlertmanagerPage',
    component: () =>
      import('./components/AlertsComponent').then(m => m.AlertsComponent),
    mountPoint: rootRouteRef,
  }),
);
