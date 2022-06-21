export type BucketValues = {
  name: string;
  status: string;
  maxSize: string;
  maxObjects: string;
  connect: bucketDetailsType;
};

export type bucketDetailsType = {
  bucketName: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
};

export type DenseTableProps = {
  bucketList: Array<BucketValues>;
  onDeleteButton: (value: BucketValues) => void;
  inProgressCheck: boolean;
};
