import {
  storageClient,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  getSignedUrl,
} from '../utils/storage'

export class StorageService {
  async getSignedUrls(paths: string[]): Promise<string[]> {
    const promises = paths.map((path) => {
      const command = new GetObjectCommand({
        Bucket: 'snipplle',
        Key: path,
      })

      return getSignedUrl(storageClient, command, {
        expiresIn: 60,
      })
    })

    return Promise.all(promises)
  }

  async getSignedUrl(path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: 'snipplle',
      Key: path,
    })

    return getSignedUrl(storageClient, command, {
      expiresIn: 60,
    })
  }

  async download(path: string): Promise<string> {
    const response = await storageClient.send(
      new GetObjectCommand({
        Bucket: 'snipplle',
        Key: path,
      }),
    )

    const body = await response.Body

    const chunks: Buffer[] = []

    for await (const chunk of body as any) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    return Buffer.from(buffer).toString('utf-8')
  }

  async upload(
    path: string,
    file: Blob,
    options?: any,
  ): Promise<string | null> {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await storageClient.send(
      new PutObjectCommand({
        Bucket: 'snipplle',
        Key: path,
        Body: buffer,
        ContentType: options?.contentType,
      }),
    )

    const isSuccess = data.$metadata.httpStatusCode === 200

    return isSuccess ? path : null
  }

  async remove(paths: string[]): Promise<void> {
    paths.map((path) =>
      storageClient.send(
        new DeleteObjectCommand({
          Bucket: 'snipplle',
          Key: path,
        }),
      ),
    )
  }
}
