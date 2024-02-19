import type { NextFunction, Request, Response } from 'express';
import { ApiError, badGatewayFromError } from '@myrotvorets/express-microservice-middlewares';
import { BadImageError, BadResponseError, FaceXError, HttpError, NetworkError } from '@myrotvorets/facex';
import { UploadError } from '../lib/uploaderror.mjs';
import { LocalsWithContainer } from '../lib/container.mjs';

/* c8 ignore start */
export function faceXErrorLoggerMiddleware(
    err: unknown,
    req: Request<never, never, never, never, LocalsWithContainer>,
    res: Response<never, LocalsWithContainer>,
    next: NextFunction,
): void {
    if (err && typeof err === 'object') {
        const logger = res.locals.container.resolve('logger');
        if (err instanceof UploadError) {
            logger.error(`UploadError: ${err.message} (${err.file})`);
        } else if (err instanceof HttpError) {
            logger.error(`HttpError ${err.code}: ${err.message} (${err.body})`);
        } else if (err instanceof NetworkError) {
            logger.error(`NetworkError: ${err.message} (${err.body})`);
        } else if (err instanceof BadResponseError) {
            logger.error(`BadResponseError: ${err.message}`);
        } else if (err instanceof BadImageError) {
            logger.error(`BadImageError: ${err.message}`);
        } else if (err instanceof FaceXError) {
            logger.error(`FaceXError: ${err.message}`);
        }
    }

    next(err);
}
/* c8 ignore stop */

export function faceXErrorHandlerMiddleware(err: unknown, _req: Request, _res: Response, next: NextFunction): void {
    if (err && typeof err === 'object') {
        if (err instanceof UploadError) {
            next(new ApiError(400, 'UPLOAD_FAILED', `${err.message} (${err.file})`, { cause: err }));
            return;
        }

        if (err instanceof HttpError || err instanceof NetworkError || err instanceof BadResponseError) {
            next(badGatewayFromError(err));
            return;
        }

        if (err instanceof BadImageError) {
            next(new ApiError(400, 'BAD_REQUEST', err.message, { cause: err }));
            return;
        }

        if (err instanceof FaceXError) {
            next(new ApiError(502, 'FACEX_ERROR', err.message, { cause: err }));
            return;
        }
    }

    next(err);
}
