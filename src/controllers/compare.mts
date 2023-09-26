import { type Request, type RequestHandler, type Response, Router } from 'express';
import type { FaceXClient } from '@myrotvorets/facex';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { CompareService } from '../services/compare.mjs';
import { uploadErrorHandlerMiddleware } from '../middleware/upload.mjs';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';

interface StartCompareResponse {
    success: true;
    guid: string;
}

function startCompareHandler(service: CompareService): RequestHandler<never, StartCompareResponse, never, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<never, StartCompareResponse, never, never>,
            res: Response<StartCompareResponse>,
        ): Promise<void> => {
            const guid = await service.upload(req.files as Express.Multer.File[]);
            res.json({
                success: true,
                guid,
            });
        },
    );
}

interface StatusParams {
    guid: string;
}

type StatusResponse =
    | {
          success: true;
          status: 'inprogress';
      }
    | {
          success: true;
          status: 'complete';
          matches: Record<string, number>;
      }
    | {
          success: true;
          status: 'nofaces';
      };

function statusHandler(service: CompareService): RequestHandler<StatusParams, StatusResponse, never, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<StatusParams, StatusResponse, never, never>,
            res: Response<StatusResponse>,
        ): Promise<void> => {
            const { guid } = req.params;
            const result = await service.status(guid);
            if (false === result) {
                res.json({ success: true, status: 'inprogress' });
            } else if (null === result) {
                res.json({ success: true, status: 'nofaces' });
            } else {
                res.json({ success: true, status: 'complete', matches: result });
            }
        },
    );
}

export function compareController(client: FaceXClient): Router {
    const router = Router();
    const service = new CompareService(client);

    router.post('/compare', startCompareHandler(service));
    router.get(
        '/compare/:guid([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})',
        statusHandler(service),
    );

    router.use(uploadErrorHandlerMiddleware);
    router.use(faceXErrorHandlerMiddleware);

    return router;
}
