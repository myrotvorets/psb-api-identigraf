import { expect } from 'chai';
import { FaceXError } from '@myrotvorets/facex';
import { UploadError } from '../../../src/lib/uploaderror.mjs';
import { CompareService } from '../../../src/services/compare.mjs';
import type { File } from '../../../src/services/types.mjs';
import { FakeClient, getComparisonResultsMock, startCompareMock, uploadPhotoForComparisonMock } from './fakeclient.mjs';
import {
    compareCompletedError,
    compareCompletedErrorComment,
    compareCompletedNoMatches,
    compareCompletedNotRecognized,
    compareCompletedPending,
    compareCompletedSuccess,
    compareCompletedSuccessProcessed,
    compareGUID,
    compareStatusUnknown,
    startCompareAckError,
    startCompareAckSuccess,
    startCompareAckSuccess_raw,
    uploadCompareAckError,
    uploadCompareAckSuccess,
} from './fixtures-compare.mjs';

describe('CompareService', function () {
    let service: CompareService;

    before(function () {
        const client = new FakeClient('https://example.com', 'FaceX/Test');
        service = new CompareService(client);
    });

    describe('#upload', function () {
        /**
         * @see https://github.com/myrotvorets/psb-api-identigraf/security/code-scanning/2
         */
        it('should fail if files is not an array', function () {
            // @ts-expect-error -- we intentionally pass a string instead of an array
            return expect(service.upload('file')).to.be.eventually.rejectedWith(TypeError, '"files" must be an array');
        });

        it('should fail if there are less than two files', function () {
            return expect(service.upload([])).to.be.eventually.rejectedWith(Error, 'Need at least two files');
        });

        it('should throw an UploadError if startCompare fails on the first photo', function () {
            startCompareMock.mock.mockImplementationOnce(() => Promise.resolve(startCompareAckError));

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files))
                .to.be.eventually.rejectedWith(UploadError)
                .that.has.property('file', files[0]!.originalname);
        });

        it('should throw an UploadError if startCompare fails on subsequent photos', function () {
            startCompareMock.mock.mockImplementationOnce(() => Promise.resolve(startCompareAckSuccess));
            uploadPhotoForComparisonMock.mock.mockImplementationOnce(() => Promise.resolve(uploadCompareAckError));

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files))
                .to.be.eventually.rejectedWith(UploadError)
                .that.has.property('file', files[1]!.originalname);
        });

        it('should succeed if everything is OK', function () {
            startCompareMock.mock.mockImplementationOnce(() => Promise.resolve(startCompareAckSuccess));
            uploadPhotoForComparisonMock.mock.mockImplementationOnce(() => Promise.resolve(uploadCompareAckSuccess));

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files)).to.become(startCompareAckSuccess_raw.data.reqID_serv);
        });
    });

    describe('#status', function () {
        it('should fail on unexpected response', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareStatusUnknown));
            return expect(service.status(compareGUID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message')
                .that.contain('FaceX response 0, code 3, comment: ');
        });

        it('should return false if the comparison is in progress', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareCompletedPending));
            return expect(service.status(compareGUID)).to.become(false);
        });

        it('should return null if no faces were recognized', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareCompletedNotRecognized));
            return expect(service.status(compareGUID)).to.become(null);
        });

        it('should return an empty object if there are not matches', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareCompletedNoMatches));
            return expect(service.status(compareGUID)).to.eventually.be.an('object').that.is.empty;
        });

        it('should fail on other error', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareCompletedError));
            return expect(service.status(compareGUID))
                .to.be.eventually.rejectedWith(FaceXError)
                .that.has.property('message')
                .that.contain(compareCompletedErrorComment);
        });

        it('should succeed if everything goes well', function () {
            getComparisonResultsMock.mock.mockImplementationOnce(() => Promise.resolve(compareCompletedSuccess));
            return expect(service.status(compareGUID)).to.become(compareCompletedSuccessProcessed);
        });
    });
});
