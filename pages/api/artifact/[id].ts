import AWS from "aws-sdk";
import { Table } from "sst/node/table";
import { NextApiRequest, NextApiResponse } from "next";
import { Bucket } from "sst/node/bucket";
import { useRouter } from "next/router";

export default async function getImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: Table.data.tableName,
    Key: { pk: "image-data", sk: id },
  };

  const { Item } = await dynamodb.get(params).promise();

  const s3 = new AWS.S3();
  const { Body } = await s3
    .getObject({
      Bucket: Bucket.images.bucketName,
      Key: `images/${id}.jpg`,
    })
    .promise();

  if (!Item || !Body) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  const {type, ...rest} = Item;
  

  const response = {
    image: Body.toString("base64"),
    ...Item,
  };

  res.status(200).json(response);
}
