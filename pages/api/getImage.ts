import AWS from "aws-sdk";
import { Bucket } from "sst/node/bucket";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, isThumbnail } = req.body;

  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const s3 = new AWS.S3();
  const data = await s3
    .getObject({
      Bucket: Bucket.images.bucketName,
      Key: `${isThumbnail ? "thumbnails" : "images"}/${id}.jpg`,
    })
    .promise();

  res.setHeader("Content-Type", "image/jpeg");
  res.send(data.Body);
}
