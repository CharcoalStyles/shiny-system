import { SSTConfig } from "sst";
import { Bucket, NextjsSite, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "shiny-system",
      region: "ap-southeast-2",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const table = new Table(stack, "data", {
        fields: {
          pk: "string",
          sk: "string",
        },
        primaryIndex: { partitionKey: "pk", sortKey: "sk" },
      });

      const prodBucket = new Bucket(stack, "images", {});
      const uploadBucket = new Bucket(stack, "uploads", {
        defaults: {
          function: {
            bind: [prodBucket, table],
          },
        },
        notifications: {
          myNotification1: {
            function: "bucket.handler",
            events: ["object_created"],
          },
        },
      });
      uploadBucket.bind([uploadBucket]);

      const site = new NextjsSite(stack, "site", {
        bind: [prodBucket, table],
        // add an environment variable to the Next.js app
        environment: {
          KOFI_ID: process.env.KOFI_ID || "kofi",
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
