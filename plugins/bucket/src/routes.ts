import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'bucket',
});

export const editRouteRef = createSubRouteRef({
  id: 'edit',
  parent: rootRouteRef,
  path: '/:name',
});
