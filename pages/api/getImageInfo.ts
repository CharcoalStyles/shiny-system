import AWS from "aws-sdk";
import { Table } from "sst/node/table";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: Table.data.tableName,
    Key: { pk: "image-data", sk: id },
  };
  try {
    const { Item } = await dynamoDB.get(params).promise();
    res.status(200).json(Item);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve image info" });
  }
}
