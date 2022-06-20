import { alertmanagerPlugin } from './plugin';

describe('alertmanager', () => {
  it('should export plugin', () => {
    expect(alertmanagerPlugin).toBeDefined();
  });
});
