import { APIGatewayProxyWithCognitoAuthorizerHandler } from "aws-lambda";

export const handler: APIGatewayProxyWithCognitoAuthorizerHandler = async () => {
  return {
    statusCode: 200,
    body: ""
  };
};
