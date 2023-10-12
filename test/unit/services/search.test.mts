import { expect } from 'chai';
import { matchers, when } from 'testdouble';
import { FaceXError } from '@myrotvorets/facex';
import { UploadError } from '../../../src/lib/uploaderror.mjs';
import { SearchService } from '../../../src/services/search.mjs';
import type { File } from '../../../src/services/types.mjs';
import {
    FakeClient,
    checkSearchStatusMock,
    getCapturedFacesMock,
    getMatchedFacesMock,
    uploadPhotoForSearchMock,
} from './fakeclient.mjs';
import {
    capturedFacesError,
    capturedFacesSuccess,
    matchedFaces,
    matchedFacesError,
    matchedFacesSuccess,
    recognizedFaces,
    searchGUID,
    searchStats,
    searchStatusCompleted,
    searchStatusFailed,
    searchStatusInProgress,
    searchUploadAck,
    searchUploadError,
} from './fixtures-search.mjs';

describe('SearchService', function () {
    let service: SearchService;

    before(function () {
        const client = new FakeClient('https://example.com', 'FaceX/Test');
        service = new SearchService(client);
    });

    describe('#upload', function () {
        let file: File;

        before(function () {
            file = { originalname: 'file1', buffer: Buffer.from(''), path: '' };
        });

        it('should throw UploadError on failure', function () {
            when(
                uploadPhotoForSearchMock(
                    matchers.anything() as Parameters<typeof uploadPhotoForSearchMock>[0],
                    undefined,
                    undefined,
                    300,
                ),
            ).thenResolve(searchUploadError);

            return expect(service.upload(file, 30)).to.be.eventually.rejectedWith(UploadError).that.has.include({
                message: searchUploadError.comment,
                file: file.originalname,
            });
        });

        it('should return request ID on success', function () {
            when(
                uploadPhotoForSearchMock(
                    matchers.anything() as Parameters<typeof uploadPhotoForSearchMock>[0],
                    undefined,
                    undefined,
                    300,
                ),
            ).thenResolve(searchUploadAck);

            return expect(service.upload(file, 30)).to.become(searchUploadAck.serverRequestID);
        });
    });

    describe('#status', function () {
        it('should return false while search is in progress', function () {
            when(checkSearchStatusMock(searchGUID)).thenResolve(searchStatusInProgress);

            return expect(service.status(searchGUID)).to.become(false);
        });

        it('should throw FaceXError on failure', function () {
            when(checkSearchStatusMock(searchStatusFailed.serverRequestID)).thenResolve(searchStatusFailed);

            return expect(service.status(searchStatusFailed.serverRequestID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message', searchStatusFailed.comment);
        });

        it('should return stats when ready', function () {
            when(checkSearchStatusMock(searchGUID)).thenResolve(searchStatusCompleted);

            return expect(service.status(searchGUID)).to.become(searchStats);
        });
    });

    describe('#recognizedFaces', function () {
        it('should throw FaceXError on failure', function () {
            when(getCapturedFacesMock(capturedFacesError.serverRequestID)).thenResolve(capturedFacesError);

            return expect(service.recognizedFaces(capturedFacesError.serverRequestID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message', capturedFacesError.comment);
        });

        it('should return captured faces on success', function () {
            when(getCapturedFacesMock(searchGUID)).thenResolve(capturedFacesSuccess);

            return expect(service.recognizedFaces(searchGUID)).to.become(recognizedFaces);
        });
    });

    describe('#matchedFaces', function () {
        it('should throw FaceXError on failure', function () {
            when(getMatchedFacesMock(matchedFacesError.serverRequestID, recognizedFaces[0]!.faceID, 0, 1)).thenResolve(
                matchedFacesError,
            );

            return expect(
                service.matchedFaces(matchedFacesError.serverRequestID, recognizedFaces[0]!.faceID, 0, 1),
            ).to.be.eventually.rejectedWith(FaceXError);
        });

        it('should return matches on success', function () {
            when(getMatchedFacesMock(searchGUID, recognizedFaces[0]!.faceID, 0, 1)).thenResolve(matchedFacesSuccess);

            return expect(service.matchedFaces(searchGUID, recognizedFaces[0]!.faceID, 0, 1)).to.become(matchedFaces);
        });
    });
});
