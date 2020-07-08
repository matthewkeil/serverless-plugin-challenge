import { DynamoDB, Lambda } from "aws-sdk";
import Serverless from "serverless";
import Plugin from "serverless/classes/Plugin";

export class CustomPostDeploy implements Plugin {
  postDeploy = async () => {
    const { cli, service, getProvider } = this.serverless;
    const aws = getProvider("aws");
    const region = aws.getRegion();
    const FunctionName = service
      .getAllFunctions()
      .find(name => name.endsWith("post-deploy-handler"));
    const { Payload } = await new Lambda({ region }).invoke({ FunctionName }).promise();
    const { Item } = await new DynamoDB({ region })
      .getItem({
        // @ts-ignore the typscript definition is incorrect and resources is not defined
        TableName: service.resources.Resources.Table.Properties.TableName,
        Key: { id: { "S": Payload.toString() } }
      })
      .promise();
    const item = JSON.stringify(DynamoDB.Converter.unmarshall(Item));
    cli.log(`successfully got the following item out of DynamoDB: ${item}`);
  };

  hooks = {
    "after:deploy:finalize": this.postDeploy
  };

  constructor(private serverless: Serverless, private options: Serverless.Options) {}
}
