import { NextApiRequest, NextApiResponse } from "next";
import { Table } from "sst/node/table";
import { v4 } from "uuid";
import sharp from "sharp";
import AWS from "aws-sdk";
import { parse } from "exifr";
import { Bucket } from "sst/node/bucket";

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { image } = req.body || {};
  const { lastModified } = req.body || { lastModified: Date.now() };

  if (!image) {
    res.status(400).json({ error: "Missing image" });
    return;
  }

  const id = v4();
  const imageBuffer = Buffer.from(image, "base64");

  const { parameters, ...r } = await parse(imageBuffer);
  console.log({ r });

  const [prompt, neg, rest]: Array<string> = parameters.split("\n");
  let negative = neg;
  let other = rest;
  if (neg.startsWith("Steps")) {
    negative = "";
    other = neg;
  }

  console.log({ parameters, prompt, negative, other });

  const tags = other.split(",").reduce((acc, curr) => {
    if (!curr.includes(":") || curr.includes("Cutoff")) {
      return acc;
    }
    const [key, value] = curr.split(":");

    if (!key || !value) {
      return acc;
    }

    console.log({ key, value });
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  //save image to s3 bucket
  const jpgImg = await sharp(imageBuffer)
    .jpeg({ quality: 80, progressive: true, force: true })
    .toBuffer();

  await s3
    .putObject({
      Bucket: Bucket.images.bucketName,
      Key: `images/${id}.jpg`,
      Body: jpgImg,
      ContentType: "image/jpeg",
    })
    .promise();

  //save image to s3 bucket
  const jpgThumb = await sharp(imageBuffer)
    .resize(200, 200, { fit: "inside" })
    .jpeg({ quality: 80, progressive: true, force: true })
    .toBuffer();

  await s3
    .putObject({
      Bucket: Bucket.images.bucketName,
      Key: `thumbnails/${id}.jpg`,
      Body: jpgThumb,
      ContentType: "image/jpeg",
    })
    .promise();

  await dynamoDb
    .put({
      TableName: Table.data.tableName,
      Item: {
        pk: "image-data",
        sk: `sd#${id}`,
        prompt,
        negative,
        tags,
      },
    })
    .promise();

  await dynamoDb
    .put({
      TableName: Table.data.tableName,
      Item: {
        pk: "image-ref",
        sk: `sd#${lastModified}`,
        id,
      },
    })
    .promise();

  res.status(200).json({ success: true, prompt, negative, tags, id });
}
