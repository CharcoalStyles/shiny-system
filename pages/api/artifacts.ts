import AWS from "aws-sdk";
import { Table } from "sst/node/table";
import { NextApiRequest, NextApiResponse } from "next";
import { Bucket } from "sst/node/bucket";

export default async function getImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const { limit, lastKey } = req.query;

  const limitNumber = parseInt(limit as string) || 10;
  const limitedLimitNumber = limitNumber > 30 ? 30 : limitNumber;

  const params = {
    TableName: Table.data.tableName,
    KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": "image-ref",
      ":sk": "sd#",
    },
    Limit: parseInt(req.query.limit as string) || 10,
    ExclusiveStartKey: lastKey
      ? JSON.parse(
          Buffer.from(req.query.lastKey as string, "base64").toString()
        )
      : undefined,
    ScanIndexForward: false, // Add this line to sort by SK in descending orderÏ
  };

  const s3 = new AWS.S3();

  try {
    const data = await dynamodb.query(params).promise();
    console.log(data);
    if (!data.Items) {
      res.status(200).json({ artifacts: [] });
      return;
    }

    const images = await Promise.all(
      data.Items.map(({ id }) => {
        console.log("id", id);
        return s3
          .getObject({
            Bucket: Bucket.images.bucketName,
            Key: `thumbnails/${id}.jpg`,
          })
          .promise();
      })
    );

    const artifacts = data.Items.map(({ id }, index) => {
      return {
        id: id,
        thumbnail: images[index].Body.toString("base64"),
      };
    });

    const response = {
      artifacts,
      lastKey: data.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString("base64")
        : undefined,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve images", e: error });
  }
}
