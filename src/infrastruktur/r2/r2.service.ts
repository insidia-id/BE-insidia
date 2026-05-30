import { InternalServerErrorException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

type UploadObjectParams = {
  key: string;
  body: Buffer;
  contentType?: string;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

@Injectable()
export class R2Service {
  private client: S3Client | null = null;

  async uploadObject({ key, body, contentType }: UploadObjectParams) {
    const config = this.getConfig();

    await this.getClient(config).send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return {
      key,
      url: this.toPublicUrl(config.publicBaseUrl, key),
    };
  }

  async deleteObject(key: string) {
    const config = this.getConfig();

    await this.getClient(config).send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      }),
    );
  }

  private getClient(config: R2Config) {
    if (!this.client) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
    }

    return this.client;
  }

  private getConfig(): R2Config {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const bucketName = process.env.R2_BUCKET_NAME?.trim();
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicBaseUrl
    ) {
      throw new InternalServerErrorException(
        'Cloudflare R2 belum dikonfigurasi dengan lengkap',
      );
    }

    return {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicBaseUrl,
    };
  }

  private toPublicUrl(baseUrl: string, key: string) {
    return `${baseUrl.replace(/\/+$/, '')}/${key}`;
  }
}
