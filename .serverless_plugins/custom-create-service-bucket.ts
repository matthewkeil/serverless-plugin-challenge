import { S3, CloudFormation } from "aws-sdk";
import Serverless from "serverless";
import Plugin from "serverless/classes/Plugin";
import { Debug } from "../lib/debug";
const debug = Debug();

class CustomCreateServiceBucket implements Plugin {
  bucketName: string;
  region: string;

  bucketExists = async () => {
    try {
      await this.serverless
        .getProvider("aws")
        .request("S3", "headBucket", { Bucket: this.bucketName });
      return true;
    } catch {
      return false;
    }
  };

  serviceStacksExist = async () => {
    let marker: string | undefined;
    const stacks = [] as AWS.CloudFormation.StackSummaries;
    do {
      const {
        NextToken,
        StackSummaries = []
      } = await this.serverless
        .getProvider("aws")
        .request("CloudFormation", "listStacks", { NextToken: marker });
      stacks.push(...StackSummaries);
      marker = NextToken;
      debug({ marker });
    } while (!!marker);
    const serviceName = this.serverless.service.getServiceName();
    const serviceStacks = stacks.filter(stack =>
      stack.StackName.includes(serviceName) &&
      stack.StackStatus !== "DELETE_COMPLETE"
    );
    debug({ serviceName, serviceStacks });
    const statement = serviceStacks.length
      ? "Stack(s) " + serviceStacks.map(stack => stack.StackName).join(", ") +
        " still exist(s).\nBucket will be deleted once all stacks are removed."
      : "All service stacks have been removed. Bucket is safe to delete.";
    this.serverless.cli.log(statement);
    return !!serviceStacks.length;
  };

  emptyBucket = async () => {
    this.serverless.cli.log(`Attempting to empty ${this.bucketName}`);
    const provider = this.serverless.getProvider("aws");
    const contents = [];
    let marker;
    do {
      const { Contents, Marker } = await provider.request("S3", "listObjects", {
        Bucket: this.bucketName,
        Marker: marker
      });
      contents.push(...Contents);
      debug({ marker });
      marker = Marker;
    } while (!!marker);
    if (contents.length) {
      await Promise.all(
        contents.map(({ Key }) =>
          provider.request("S3", "deleteObject", {
            Bucket: this.bucketName,
            Key
          })
        )
      );
    }
    this.serverless.cli.log(`Bucket ${this.bucketName} is empty`);
  };

  createBucketIfNecessary = async () => {
    // @ts-ignore the typscript definition is incorrect and resources is not defined
    if (!this.serverless.processedInput.commands.includes("deploy")) {
      return;
    }
    if (await this.bucketExists()) {
      return;
    }
    await this.serverless.getProvider("aws").request("S3", "createBucket", {
      Bucket: this.bucketName
    });
    this.serverless.cli.log(`Created bucket: ${this.bucketName}`);
  };

  deleteBucketIfNecessary = async () => {
    // @ts-ignore the typscript definition is incorrect and resources is not defined
    if (!this.serverless.processedInput.commands.includes("remove")) {
      return;
    }
    if (await this.serviceStacksExist()) {
      return;
    }
    await this.emptyBucket();
    await this.serverless.getProvider("aws").request("S3", "deleteBucket", {
      Bucket: this.bucketName
    });
    this.serverless.cli.log(`Deleted bucket: ${this.bucketName}`);
  };

  hooks = {
    "aws:common:validate:validate": this.createBucketIfNecessary,
    "remove:remove": this.deleteBucketIfNecessary
  };

  constructor(
    private serverless: Serverless,
    private options: Serverless.Options
  ) {
    this.bucketName = this.serverless.service.getServiceName();
    this.region = this.serverless.getProvider("aws").getRegion();
  }
}

module.exports = CustomCreateServiceBucket;


