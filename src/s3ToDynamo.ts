import { Handler } from "aws-lambda";
import { DynamoDB, S3 } from "aws-sdk";
import { v4 } from "uuid";

const dynamo = new DynamoDB({ region: process.env.AWS_REGION });
const s3 = new S3({ region: process.env.AWS_REGION });

export const handler: Handler = async (Key: string) => {
  console.log({ Key });
  const { Body } = await s3
    .getObject({ Bucket: process.env.BUCKET, Key })
    .promise();
  const id = v4();
  const item = {
    ...JSON.parse(Body.toString()),
    id
  };
  console.log({ item });
  const results = await dynamo
    .putItem({
      TableName: process.env.TABLE_NAME,
      Item: DynamoDB.Converter.marshall(item)
    })
    .promise();
  console.log({ results });
  return {
    statusCode: 200,
    body: id
  };
};
