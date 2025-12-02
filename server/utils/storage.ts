import {
  PutBucketCorsCommand,
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const runtimeConfig = useRuntimeConfig()

export const storageClient = new S3Client({
  region: runtimeConfig.AWS_REGION,
  endpoint: `https://${runtimeConfig.AWS_ENDPOINT}`,
  credentials: {
    accessKeyId: runtimeConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: runtimeConfig.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

storageClient.send(
  new PutBucketCorsCommand({
    Bucket: runtimeConfig.BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
          AllowedOrigins: ['*'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  }),
)

export { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, getSignedUrl }
