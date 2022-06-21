import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const bucketPlugin = createPlugin({
  id: 'bucket',
  featureFlags: [{ name: 'bucket' }],
  routes: {
    root: rootRouteRef,
  },
});

export const BucketPage = bucketPlugin.provide(
  createRoutableExtension({
    name: 'BucketPage',
    component: () =>
      import('./components/BucketComponent').then(m => m.BucketComponent),
    mountPoint: rootRouteRef,
  }),
);
