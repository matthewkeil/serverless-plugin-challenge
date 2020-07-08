import Serverless from "serverless";
import Plugin from "serverless/classes/Plugin";

interface CustomPostDeployOptions {}

export class CustomPostDeploy implements Plugin {
  hooks = {};

  constructor(public serverless: Serverless, options: Serverless.Options) {}
}
