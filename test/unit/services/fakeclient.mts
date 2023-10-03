/* eslint-disable class-methods-use-this */
import { FaceXClient } from '@myrotvorets/facex';
import { func } from 'testdouble';

export const uploadPhotoForSearchMock = func<typeof FaceXClient.prototype.uploadPhotoForSearch>();
export const checkSearchStatusMock = func<typeof FaceXClient.prototype.checkSearchStatus>();
export const getCapturedFacesMock = func<typeof FaceXClient.prototype.getCapturedFaces>();
export const getRecognitionStatsMock = func<typeof FaceXClient.prototype.getRecognitionStats>();
export const getMatchedFacesMock = func<typeof FaceXClient.prototype.getMatchedFaces>();
export const startCompareMock = func<typeof FaceXClient.prototype.startCompare>();
export const uploadPhotoForComparisonMock = func<typeof FaceXClient.prototype.uploadPhotoForComparison>();
export const getComparisonResultsMock = func<typeof FaceXClient.prototype.getComparisonResults>();

export class FakeClient extends FaceXClient {
    public uploadPhotoForSearch(
        ...params: Parameters<typeof uploadPhotoForSearchMock>
    ): ReturnType<typeof uploadPhotoForSearchMock> {
        return uploadPhotoForSearchMock(...params);
    }

    public checkSearchStatus(
        ...params: Parameters<typeof checkSearchStatusMock>
    ): ReturnType<typeof checkSearchStatusMock> {
        return checkSearchStatusMock(...params);
    }

    public getCapturedFaces(
        ...params: Parameters<typeof getCapturedFacesMock>
    ): ReturnType<typeof getCapturedFacesMock> {
        return getCapturedFacesMock(...params);
    }

    public getRecognitionStats(
        ...params: Parameters<typeof getRecognitionStatsMock>
    ): ReturnType<typeof getRecognitionStatsMock> {
        return getRecognitionStatsMock(...params);
    }

    public getMatchedFaces(...params: Parameters<typeof getMatchedFacesMock>): ReturnType<typeof getMatchedFacesMock> {
        return getMatchedFacesMock(...params);
    }

    public startCompare(...params: Parameters<typeof startCompareMock>): ReturnType<typeof startCompareMock> {
        return startCompareMock(...params);
    }

    public uploadPhotoForComparison(
        ...params: Parameters<typeof uploadPhotoForComparisonMock>
    ): ReturnType<typeof uploadPhotoForComparisonMock> {
        return uploadPhotoForComparisonMock(...params);
    }

    public getComparisonResults(
        ...params: Parameters<typeof getComparisonResultsMock>
    ): ReturnType<typeof getComparisonResultsMock> {
        return getComparisonResultsMock(...params);
    }
}