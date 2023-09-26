import { expect } from 'chai';
import express, { type Express } from 'express';
import request, { type Response as SuperTestResponse } from 'supertest';
import { errorMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { BadImageError, BadResponseError, FaceXError, HttpError, NetworkError } from '@myrotvorets/facex';
import { environment } from '../../../src/lib/environment.mjs';
import { UploadError } from '../../../src/lib/uploaderror.mjs';
import { faceXErrorHandlerMiddleware } from '../../../src/middleware/error.mjs';

describe('faceXErrorHandlerMiddleware', function () {
    let app: Express;
    let env: typeof process.env;

    before(function () {
        env = { ...process.env };
    });

    beforeEach(function () {
        process.env = {
            NODE_ENV: 'test',
            PORT: '3030',
            FACEX_URL: 'https://example.com',
        };

        environment();

        app = express();
        app.disable('x-powered-by');
    });

    afterEach(function () {
        process.env = { ...env };
    });

    const expectError = (res: SuperTestResponse, code: string, status: number): unknown =>
        expect(res.body).to.be.an('object').and.include({
            success: false,
            code,
            status,
        });

    const expectBadGateway = (res: SuperTestResponse): unknown => expectError(res, 'BAD_GATEWAY', 502);

    it('should ignore non-errors', function () {
        app.use('/', (_req, _res, next) => next(123));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app)
            .get('/')
            .expect(500)
            .expect((res) => expect(res.body).to.be.an('object').that.is.empty);
    });

    it('should catch UploadError', function () {
        app.use('/', (_req, _res, next) => next(new UploadError('message', 'file')));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app)
            .get('/')
            .expect(400)
            .expect('Content-Type', /json/u)
            .expect((res) => expectError(res, 'UPLOAD_FAILED', 400));
    });

    it('should catch FaceX HttpError', function () {
        app.use('/', (_req, _res, next) => next(new HttpError({ status: 418, statusText: "I'm a teapot" })));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app).get('/').expect(502).expect('Content-Type', /json/u).expect(expectBadGateway);
    });

    it('should catch FaceX NetworkError', function () {
        app.use('/', (_req, _res, next) => next(new NetworkError('Boom-boom bye-bye')));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app).get('/').expect(502).expect('Content-Type', /json/u).expect(expectBadGateway);
    });

    it('should catch FaceX BadResponseError', function () {
        app.use('/', (_req, _res, next) => next(new BadResponseError('Boom-boom bye-bye')));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app).get('/').expect(502).expect('Content-Type', /json/u).expect(expectBadGateway);
    });

    it('should catch FaceXError', function () {
        app.use('/', (_req, _res, next) => next(new FaceXError('Boom-boom bye-bye')));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app)
            .get('/')
            .expect(502)
            .expect('Content-Type', /json/u)
            .expect((res) => expectError(res, 'FACEX_ERROR', 502));
    });

    it('should catch BadImageError', function () {
        app.use('/', (_req, _res, next) => next(new BadImageError('Boom-boom bye-bye')));
        app.use(faceXErrorHandlerMiddleware);
        app.use(errorMiddleware);
        return request(app)
            .get('/')
            .expect(400)
            .expect('Content-Type', /json/u)
            .expect((res) => expectError(res, 'BAD_REQUEST', 400));
    });
});
