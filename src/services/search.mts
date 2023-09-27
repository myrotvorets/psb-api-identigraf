import { createReadStream } from 'node:fs';
import {
    CapturedFaces,
    type Client,
    FaceXError,
    MatchedFaces,
    SearchCompleted,
    SearchInProgress,
    type SearchStats,
    SearchUploadAck,
} from '@myrotvorets/facex';
import { UploadError } from '../lib/uploaderror.mjs';
import type { File } from './types.mjs';

export interface RecoginizedFace {
    faceID: number;
    minSimilarity: number;
    maxSimilarity: number;
    face: string;
}

export interface MatchedFace {
    similarity: number;
    objname: string;
    face: string;
}

export class SearchService {
    private readonly client: Client;

    public constructor(client: Client) {
        this.client = client;
        this.client.timeout = 3_600_000;
    }

    public async upload(file: File, minSimilarity: number): Promise<string> {
        const response = await this.client.uploadPhotoForSearch(
            file.path ? /* c8 ignore next */ createReadStream(file.path) : file.buffer,
            undefined,
            undefined,
            minSimilarity * 10,
        );
        if (response instanceof SearchUploadAck && !response.isError()) {
            return response.serverRequestID;
        }

        throw new UploadError(response.comment, file.originalname);
    }

    /**
     * Return false if the search is in progress, array of SearchStats on success,
     * and throws an exception on failure
     */
    public async status(guid: string): Promise<SearchStats[] | false> {
        const response = await this.client.checkSearchStatus(guid);
        if (!response.isError()) {
            if (response instanceof SearchInProgress) {
                return false;
            }

            if (response instanceof SearchCompleted) {
                return response.stats;
            }
        }

        throw new FaceXError(response.comment);
    }

    public async recognizedFaces(guid: string): Promise<RecoginizedFace[]> {
        const response = await this.client.getCapturedFaces(guid);
        if (!response.isError() && response instanceof CapturedFaces) {
            const faces: RecoginizedFace[] = [];
            for (const { faceID, minSimilarity, maxSimilarity, face } of response) {
                faces.push({ faceID, minSimilarity, maxSimilarity, face });
            }

            return faces;
        }

        // getCapturedFaces() may return SearchInProgress if called prematurely

        throw new FaceXError(response.comment);
    }

    public async matchedFaces(guid: string, faceID: number, offset: number, count: number): Promise<MatchedFace[]> {
        const response = await this.client.getMatchedFaces(guid, faceID, offset, count);
        if (!response.isError() && response instanceof MatchedFaces) {
            const faces: MatchedFace[] = [];
            for (const item of response) {
                faces.push({ similarity: item.similarity, objname: item.nameL, face: item.face });
            }

            return faces;
        }

        throw new FaceXError(response.type === 229 ? 'Unknown error' : /* c8 ignore next */ response.comment);
    }
}
