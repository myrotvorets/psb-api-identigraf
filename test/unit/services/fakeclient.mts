import { mock } from 'node:test';
import { FaceXClient } from '@myrotvorets/facex';

export const uploadPhotoForSearchMock = mock.fn<typeof FaceXClient.prototype.uploadPhotoForSearch>();
export const checkSearchStatusMock = mock.fn<typeof FaceXClient.prototype.checkSearchStatus>();
export const getCapturedFacesMock = mock.fn<typeof FaceXClient.prototype.getCapturedFaces>();
export const getRecognitionStatsMock = mock.fn<typeof FaceXClient.prototype.getRecognitionStats>();
export const getMatchedFacesMock = mock.fn<typeof FaceXClient.prototype.getMatchedFaces>();
export const startCompareMock = mock.fn<typeof FaceXClient.prototype.startCompare>();
export const uploadPhotoForComparisonMock = mock.fn<typeof FaceXClient.prototype.uploadPhotoForComparison>();
export const getComparisonResultsMock = mock.fn<typeof FaceXClient.prototype.getComparisonResults>();

export class FakeClient extends FaceXClient {
    public override uploadPhotoForSearch(
        ...params: Parameters<typeof uploadPhotoForSearchMock>
    ): ReturnType<typeof uploadPhotoForSearchMock> {
        return uploadPhotoForSearchMock(...params);
    }

    public override checkSearchStatus(
        ...params: Parameters<typeof checkSearchStatusMock>
    ): ReturnType<typeof checkSearchStatusMock> {
        return checkSearchStatusMock(...params);
    }

    public override getCapturedFaces(
        ...params: Parameters<typeof getCapturedFacesMock>
    ): ReturnType<typeof getCapturedFacesMock> {
        return getCapturedFacesMock(...params);
    }

    public override getRecognitionStats(
        ...params: Parameters<typeof getRecognitionStatsMock>
    ): ReturnType<typeof getRecognitionStatsMock> {
        return getRecognitionStatsMock(...params);
    }

    public override getMatchedFaces(
        ...params: Parameters<typeof getMatchedFacesMock>
    ): ReturnType<typeof getMatchedFacesMock> {
        return getMatchedFacesMock(...params);
    }

    public override startCompare(...params: Parameters<typeof startCompareMock>): ReturnType<typeof startCompareMock> {
        return startCompareMock(...params);
    }

    public override uploadPhotoForComparison(
        ...params: Parameters<typeof uploadPhotoForComparisonMock>
    ): ReturnType<typeof uploadPhotoForComparisonMock> {
        return uploadPhotoForComparisonMock(...params);
    }

    public override getComparisonResults(
        ...params: Parameters<typeof getComparisonResultsMock>
    ): ReturnType<typeof getComparisonResultsMock> {
        return getComparisonResultsMock(...params);
    }
}
