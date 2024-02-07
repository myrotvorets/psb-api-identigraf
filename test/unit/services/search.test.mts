import { expect } from 'chai';
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
            uploadPhotoForSearchMock.mock.mockImplementationOnce(() => searchUploadError);
            return expect(service.upload(file, 30)).to.be.eventually.rejectedWith(UploadError).that.include({
                message: searchUploadError.comment,
                file: file.originalname,
            });
        });

        it('should return request ID on success', function () {
            uploadPhotoForSearchMock.mock.mockImplementationOnce(() => searchUploadAck);
            return expect(service.upload(file, 30)).to.become(searchUploadAck.serverRequestID);
        });
    });

    describe('#status', function () {
        it('should return false while search is in progress', function () {
            checkSearchStatusMock.mock.mockImplementationOnce(() => searchStatusInProgress);
            return expect(service.status(searchGUID)).to.become(false);
        });

        it('should throw FaceXError on failure', function () {
            checkSearchStatusMock.mock.mockImplementationOnce(() => searchStatusFailed);
            return expect(service.status(searchStatusFailed.serverRequestID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message')
                .that.contain(searchStatusFailed.comment);
        });

        it('should return stats when ready', function () {
            checkSearchStatusMock.mock.mockImplementationOnce(() => searchStatusCompleted);
            return expect(service.status(searchGUID)).to.become(searchStats);
        });
    });

    describe('#recognizedFaces', function () {
        it('should throw FaceXError on failure', function () {
            getCapturedFacesMock.mock.mockImplementationOnce(() => capturedFacesError);
            return expect(service.recognizedFaces(capturedFacesError.serverRequestID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message')
                .that.contain(capturedFacesError.comment);
        });

        it('should return captured faces on success', function () {
            getCapturedFacesMock.mock.mockImplementationOnce(() => capturedFacesSuccess);
            return expect(service.recognizedFaces(searchGUID)).to.become(recognizedFaces);
        });
    });

    describe('#matchedFaces', function () {
        it('should throw FaceXError on failure', function () {
            getMatchedFacesMock.mock.mockImplementationOnce(() => matchedFacesError);
            return expect(
                service.matchedFaces(matchedFacesError.serverRequestID, recognizedFaces[0]!.faceID, 0, 1),
            ).to.be.eventually.rejectedWith(FaceXError);
        });

        it('should return matches on success', function () {
            getMatchedFacesMock.mock.mockImplementationOnce(() => matchedFacesSuccess);
            return expect(service.matchedFaces(searchGUID, recognizedFaces[0]!.faceID, 0, 1)).to.become(matchedFaces);
        });
    });
});
