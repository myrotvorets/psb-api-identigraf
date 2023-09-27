import { expect } from 'chai';
import { matchers, when } from 'testdouble';
import { FaceXError } from '@myrotvorets/facex';
import { UploadError } from '../../../src/lib/uploaderror.mjs';
import { CompareService } from '../../../src/services/compare.mjs';
import { File } from '../../../src/services/types.mjs';
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
} from './fixtures.mjs';

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
            return expect(service.upload('file')).to.eventually.rejectedWith(TypeError, '"files" must be an array');
        });

        it('should fail if there are less than two files', function () {
            return expect(service.upload([])).to.eventually.rejectedWith(Error, 'Need at least two files');
        });

        it('should throw an UploadError if startCompare fails on the first photo', function () {
            when(startCompareMock(matchers.anything() as Parameters<typeof startCompareMock>[0], 1, '0')).thenResolve(
                startCompareAckError,
            );

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files))
                .to.eventually.rejectedWith(UploadError)
                .that.has.property('file', files[0].originalname);
        });

        it('should throw an UploadError if startCompare fails on subsequent photos', function () {
            when(startCompareMock(matchers.anything() as Parameters<typeof startCompareMock>[0], 1, '0')).thenResolve(
                startCompareAckSuccess,
            );

            when(
                uploadPhotoForComparisonMock(
                    matchers.anything() as Parameters<typeof uploadPhotoForComparisonMock>[0],
                    startCompareAckSuccess_raw.data.reqID_serv,
                    1,
                    1,
                    '1',
                ),
            ).thenResolve(uploadCompareAckError);

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files))
                .to.eventually.rejectedWith(UploadError)
                .that.has.property('file', files[1].originalname);
        });

        it('should succeed if everything is OK', function () {
            when(startCompareMock(matchers.anything() as Parameters<typeof startCompareMock>[0], 1, '0')).thenResolve(
                startCompareAckSuccess,
            );

            when(
                uploadPhotoForComparisonMock(
                    matchers.anything() as Parameters<typeof uploadPhotoForComparisonMock>[0],
                    startCompareAckSuccess_raw.data.reqID_serv,
                    1,
                    1,
                    '1',
                ),
            ).thenResolve(uploadCompareAckSuccess);

            const files: File[] = [
                { originalname: 'file1', buffer: Buffer.from(''), path: '' },
                { originalname: 'file2', buffer: Buffer.from(''), path: '' },
            ];

            return expect(service.upload(files)).to.become(startCompareAckSuccess_raw.data.reqID_serv);
        });
    });

    describe('#status', function () {
        it('should fail on unexpected response', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareStatusUnknown);

            return expect(service.status(compareGUID))
                .to.eventually.rejectedWith(FaceXError)
                .that.has.property('message', 'Unknown error');
        });

        it('should return false if the comparison is in progress', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareCompletedPending);

            return expect(service.status(compareGUID)).to.become(false);
        });

        it('should return null if no faces were recognized', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareCompletedNotRecognized);

            return expect(service.status(compareGUID)).to.become(null);
        });

        it('should return an empty object if there are not matches', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareCompletedNoMatches);

            return expect(service.status(compareGUID)).to.eventually.be.an('object').that.is.empty;
        });

        it('should fail on other error', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareCompletedError);

            return expect(service.status(compareGUID))
                .to.eventually.rejectedWith(FaceXError)
                .that.has.property('message', compareCompletedErrorComment);
        });

        it('should succeed if everything goes well', function () {
            when(getComparisonResultsMock(compareGUID)).thenResolve(compareCompletedSuccess);

            return expect(service.status(compareGUID)).to.become(compareCompletedSuccessProcessed);
        });
    });
});
