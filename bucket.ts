import AWS from "aws-sdk";
import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { parse } from "exifr";
import sharp from "sharp";
import { v4 } from "uuid";

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

type Event = {
  Records: Array<{
    s3: {
      object: {
        key: string;
      };
    };
  }>;
};

export const handler = async (event: Event) => {
  //for each record in the event, get the image from the bucket
  for (const record of event.Records) {
    const { key } = record.s3.object;
    const filteredKey = decodeURIComponent(key.replace(/\+/g, " "));

    // if the key doesn't end in .png, then it's not an image
    if (!filteredKey.endsWith(".png")) {
      continue;
    }

    const data = await s3
      .getObject({
        Bucket: Bucket.uploads.bucketName,
        Key: filteredKey,
      })
      .promise();

    const id = v4();

    // get the buffer from the data
    const imageBuffer = data.Body as Buffer;

    const { parameters, ...r } = await parse(imageBuffer);

    const [prompt, neg, rest]: Array<string> = parameters.split("\n");
    let negative = neg;
    let other = rest;
    if (neg.startsWith("Steps")) {
      negative = "";
      other = neg;
    }

    const [type, filename] = filteredKey.split("/");
    const [inc, dateTime, model] = filename.split("-");

    // await s3
    //   .putObject({
    //     Bucket: Bucket.uploads.bucketName,
    //     Key: `${type}/${id}.json`,
    //     Body: JSON.stringify({ type, filename, inc, dateTime, model }),
    //   })
    //   .promise();

    const tags = other.split(",").reduce((acc, curr) => {
      if (!curr.includes(":") || curr.includes("Cutoff")) {
        return acc;
      }
      const [key, value] = curr.split(":");

      if (!key || !value) {
        return acc;
      }

      acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    const jpgImg = await sharp(imageBuffer)
      .jpeg({ quality: 90, progressive: true, force: true })
      .toBuffer();

    await s3
      .putObject({
        Bucket: Bucket.images.bucketName,
        Key: `images/${id}.jpg`,
        Body: jpgImg,
        ContentType: "image/jpeg",
      })
      .promise();

    const jpgThumb = await sharp(imageBuffer)
      .resize(200, 200, { fit: "inside" })
      .jpeg({ quality: 90, progressive: true, force: true })
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
          sk: `${id}`,
          prompt,
          negative,
          tags,
          type,
          model: model === "xyz" ? "unknown" : model,
        },
      })
      .promise();

    await dynamoDb
      .put({
        TableName: Table.data.tableName,
        Item: {
          pk: "image-ref",
          sk: `${type}#${dateTime}`,
          id,
          type,
        },
      })
      .promise();

    //delete the original image from the bucket
    await s3
      .deleteObject({
        Bucket: Bucket.uploads.bucketName,
        Key: filteredKey,
      })
      .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
