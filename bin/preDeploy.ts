require("dotenv").config();
import { resolve } from "path";
import YAML from "yamljs";
import { S3 } from "aws-sdk";
import { Debug } from "../lib/debug";
const debug = Debug();
import { generate as Generate } from "shortid";
import { writeFileSync } from "fs";
const generate = () =>
  Generate()
    .replace(/[-_A-Z]/g, `${Math.floor(Math.random() * 10)}`)
    .slice(0, 7);

const awsConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
const s3 = new S3(awsConfig);

const CONFIG_PATH = resolve(__dirname, "..", "serverless.yml");
let _config;
const config = (reload = false) => {
  if (!_config || reload) {
    debug("loading yaml");
    _config = YAML.load(CONFIG_PATH);
  }
  debug({ _config });
  return _config;
};

const getBucketName = async () => {
  const prefix = config().service.name;
  debug({ prefix });
  let name: string;
  try {
    const { Buckets = [] } = await s3.listBuckets().promise();
    const bucket = Buckets.find(({ Name }) => Name.startsWith(prefix));
    debug({ bucket });
    name = bucket.Name;
  } catch {
    name = `${prefix}-${generate()}`;
  }
  console.log("Deployment bucket is: ", name);
  return name;
};

const updateYaml = (bucketName: string) => {
  const updated = {
    ...config(),
    custom: { ...config().custom, bucketName }
  };
  debug({ updated });
  writeFileSync(CONFIG_PATH, YAML.stringify(updated, 2));
  console.log("updated serverless.yml deployment bucket");
  config(true);
};

const preDeploy = async () => {
  const Bucket = await getBucketName();
  try {
    await s3.headBucket({ Bucket }).promise();
    console.log("Deployment bucket found");
    return;
  } catch {
    await s3.createBucket({ Bucket }).promise();
    console.log(`Created bucket: ${Bucket}`);
  } finally {
    if (Bucket !== config().custom.bucketName) {
      updateYaml(Bucket);
    }
  }
};

if (require.main === module) {
  preDeploy();
}
