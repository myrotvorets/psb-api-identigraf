import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ApiError } from '@myrotvorets/express-microservice-middlewares';

export function uploadErrorHandlerMiddleware(err: unknown, _req: Request, _res: Response, next: NextFunction): void {
    if (err && typeof err === 'object' && err instanceof MulterError) {
        let code = 'BAD_REQUEST';

        switch (err.code) {
            case 'LIMIT_PART_COUNT':
            case 'LIMIT_FILE_SIZE':
            case 'LIMIT_FILE_COUNT':
            case 'LIMIT_FIELD_KEY':
            case 'LIMIT_FIELD_VALUE':
            case 'LIMIT_FIELD_COUNT':
            case 'LIMIT_UNEXPECTED_FILE':
                code = `UPLOAD_${err.code}`;
                break;

            default:
                break;
        }

        next(new ApiError(400, code, err.message, { cause: err }));
    } else {
        next(err);
    }
}
