import { FaceXError, Response } from '@myrotvorets/facex';

export class DetailedFaceXError extends FaceXError {
    public response: Response;

    public constructor(response: Response) {
        super(`FaceX response ${response.type}, code ${response.resultCode}, comment: ${response.comment}`);
        this.name = 'DetailedFaceXError';
        this.response = response;
    }
}
