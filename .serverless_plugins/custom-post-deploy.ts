import { DynamoDB } from "aws-sdk";
import Serverless from "serverless";
import Plugin from "serverless/classes/Plugin";
import { Debug } from "../lib/debug";
const debug = Debug();

class CustomPostDeploy implements Plugin {
  postDeploy = async () => {
    const { cli, service } = this.serverless;
    const provider = this.serverless.getProvider("aws");
    const { Payload } = await provider.request("Lambda", "invoke", {
      Payload: JSON.stringify(service.custom.s3Key),
      FunctionName: service
        .getAllFunctionsNames()
        .find(name => name.endsWith("post-deploy-handler"))
    });
    debug({ Payload });
    const { Item } = await provider.request("DynamoDB", "getItem", {
      // @ts-ignore the typscript definition is incorrect and resources is not defined
      TableName: service.resources.Resources.Table.Properties.TableName,
      Key: { id: { "S": JSON.parse(Payload).body } }
    });
    const item = DynamoDB.Converter.unmarshall(Item);
    debug({ item });
    cli.log(`successfully got the following message out of DynamoDB: "${item.message}"`);
  };

  hooks = {
    "after:deploy:finalize": this.postDeploy
  };

  constructor(
    private serverless: Serverless,
    private options: Serverless.Options
  ) {}
}

module.exports = CustomPostDeploy;
