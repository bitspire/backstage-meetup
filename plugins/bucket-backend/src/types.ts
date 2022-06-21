export type InstancesResponse = {
  username: string;
  service: string;
  count: number;
  instances: BucketConfig[];
};

export type BucketConfig = {
  name: string;
  maxSize: string;
  maxObjects: string;
  connect?: string;
  status?: 'Ready' | 'Pending';
};
