import { type Request, type Response, Router } from 'express';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { uploadErrorHandlerMiddleware } from '../middleware/upload.mjs';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';
import type { LocalsWithContainer } from '../lib/container.mjs';

interface StartCompareResponse {
    success: true;
    guid: string;
}

async function startCompareHandler(
    req: Request<never, StartCompareResponse, never, never, LocalsWithContainer>,
    res: Response<StartCompareResponse, LocalsWithContainer>,
): Promise<void> {
    const service = res.locals.container.resolve('compareService');
    const guid = await service.upload(req.files as Express.Multer.File[]);
    res.json({
        success: true,
        guid,
    });
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

async function statusHandler(
    req: Request<StatusParams, StatusResponse, never, never, LocalsWithContainer>,
    res: Response<StatusResponse, LocalsWithContainer>,
): Promise<void> {
    const { guid } = req.params;
    const service = res.locals.container.resolve('compareService');
    const result = await service.status(guid);
    if (false === result) {
        res.json({ success: true, status: 'inprogress' });
    } else if (null === result) {
        res.json({ success: true, status: 'nofaces' });
    } else {
        res.json({ success: true, status: 'complete', matches: result });
    }
}

export function compareController(): Router {
    const router = Router();

    router.post('/compare', asyncWrapperMiddleware(startCompareHandler));
    router.get(
        '/compare/:guid([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})',
        asyncWrapperMiddleware(statusHandler),
    );

    router.use(uploadErrorHandlerMiddleware);
    router.use(faceXErrorHandlerMiddleware);

    return router;
}
