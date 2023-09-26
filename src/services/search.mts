import { createReadStream } from 'node:fs';
import {
    CapturedFaces,
    Client,
    FaceXError,
    MatchedFaces,
    SearchCompleted,
    SearchInProgress,
    SearchStats,
    SearchUploadAck,
} from '@myrotvorets/facex';
import { UploadError } from '../lib/uploaderror.mjs';

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

    public async upload(file: Express.Multer.File, minSimilarity: number): Promise<string> {
        const response = await this.client.uploadPhotoForSearch(
            file.path ? createReadStream(file.path) : file.buffer,
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

        throw new FaceXError(response.comment);
    }

    public async matchedFaces(guid: string, faceID: number, offset: number, count: number): Promise<MatchedFace[]> {
        const response = await this.client.getMatchedFaces(guid, faceID, offset, count);
        if (!response.isError() && response instanceof MatchedFaces) {
            const faces: MatchedFace[] = [];
            // FaceX developers break compatibility without any warning :-(
            // Some faces have the object name in `nameL` field (until resync is completed),
            // while the others have it in `comment` parameter of `path`
            for (const item of response) {
                let objName: string;
                if (
                    /^\{[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\}$/u.test(
                        item.nameL,
                    )
                ) {
                    objName = item.pathParsed[3];
                } else {
                    objName = item.nameL;
                }

                // And there are cases when we have no object information :-(
                if (!objName) {
                    objName = `!1-0-${parseInt(item.pathParsed[0].replace(/:/gu, ''), 10)}-0`;
                }

                objName = objName.replace(/(?:^\{)|(?:\}#?$)/gu, '');
                faces.push({ similarity: item.similarity, objname: objName, face: item.face });
            }

            return faces;
        }

        throw new FaceXError(response.comment);
    }
}
