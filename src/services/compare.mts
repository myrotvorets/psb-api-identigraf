import { createReadStream } from 'node:fs';
import { Client, CompareCompleted, FaceXError } from '@myrotvorets/facex';
import { UploadError } from '../lib/uploaderror.mjs';

export class CompareService {
    private readonly client: Client;

    public constructor(client: Client) {
        this.client = client;
    }

    public async upload(files: Express.Multer.File[]): Promise<string> {
        if (files.length < 2) {
            throw new Error('Need at least two files');
        }

        const startResponse = await this.client.startCompare(
            files[0].path ? createReadStream(files[0].path) : files[0].buffer,
            files.length - 1,
            '0',
        );

        if (startResponse.isError()) {
            throw new UploadError(startResponse.comment, files[0].originalname);
        }

        for (let i = 1; i < files.length; ++i) {
            // eslint-disable-next-line no-await-in-loop
            const uploadResponse = await this.client.uploadPhotoForComparison(
                files[i].path ? createReadStream(files[i].path) : files[i].buffer,
                startResponse.serverRequestID,
                i,
                files.length - 1,
                `${i}`,
            );

            if (uploadResponse.isError()) {
                throw new UploadError(uploadResponse.comment, files[i].originalname);
            }
        }

        return startResponse.serverRequestID;
    }

    /**
     * Return false if the comparison is in progress, Record<string, number> on success,
     * and throws an exception on failure
     */
    public async status(guid: string): Promise<Record<string, number> | false | null> {
        const result: Record<string, number> = {};
        const response = await this.client.getComparisonResults(guid);
        if (response instanceof CompareCompleted) {
            if (response.isPending()) {
                return false;
            }

            if (response.resultCode === -7) {
                // No matches found
                return result;
            }

            if (response.resultCode === -3) {
                // No faces recognized
                return null;
            }

            if (response.isError()) {
                throw new FaceXError(response.comment);
            }

            for (const item of response) {
                result[item.name] = item.similarity;
            }

            return result;
        }

        throw new FaceXError('Unknown error');
    }
}
