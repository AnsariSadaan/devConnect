import { SESClient } from "@aws-sdk/client-ses";
import dotenv from 'dotenv';
dotenv.config();
// Set the AWS Region.
const REGION = "ap-south-1";
// Create SES service object.
const sesClient = new SESClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// console.log("AWS credentials:", {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

export { sesClient };
// snippet-end:[ses.JavaScript.createclientv3]