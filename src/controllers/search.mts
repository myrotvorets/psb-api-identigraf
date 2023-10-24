import { type Request, type Response, Router } from 'express';
import type { SearchStats } from '@myrotvorets/facex';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { numberParamHandler } from '@myrotvorets/express-microservice-middlewares';
import type { MatchedFace, RecoginizedFace } from '../services/search.mjs';
import { uploadErrorHandlerMiddleware } from '../middleware/upload.mjs';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';
import type { LocalsWithContainer } from '../lib/container.mjs';

interface StartSearchRequest {
    minSimilarity: number;
}

interface StartSearchResponse {
    success: true;
    guid: string;
}

async function startSearchHandler(
    req: Request<never, StartSearchResponse, StartSearchRequest, never, LocalsWithContainer>,
    res: Response<StartSearchResponse, LocalsWithContainer>,
): Promise<void> {
    const service = res.locals.container.resolve('searchService');
    const guid = await service.upload((req.files as Express.Multer.File[])[0]!, req.body.minSimilarity);
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
          stats: SearchStats[];
      };

async function statusHandler(
    req: Request<StatusParams, StatusResponse, never, never, LocalsWithContainer>,
    res: Response<StatusResponse, LocalsWithContainer>,
): Promise<void> {
    const { guid } = req.params;
    const service = res.locals.container.resolve('searchService');
    const result = await service.status(guid);
    if (false === result) {
        res.json({ success: true, status: 'inprogress' });
    } else {
        res.json({ success: true, status: 'complete', stats: result });
    }
}

interface CapturedFacesResponse {
    success: true;
    faces: RecoginizedFace[];
}

async function capturedFacesHandler(
    req: Request<StatusParams, CapturedFacesResponse, never, never, LocalsWithContainer>,
    res: Response<CapturedFacesResponse, LocalsWithContainer>,
): Promise<void> {
    const { guid } = req.params;
    const service = res.locals.container.resolve('searchService');
    const result = await service.recognizedFaces(guid);
    res.json({ success: true, faces: result });
}

interface MatchedFacesParams {
    guid: string;
    faceid: number;
    offset: number;
    count: number;
}

interface MatchedFacesResponse {
    success: true;
    matches: MatchedFace[];
}

async function matchedFacesHandler(
    req: Request<MatchedFacesParams, MatchedFacesResponse, never, never, LocalsWithContainer>,
    res: Response<MatchedFacesResponse, LocalsWithContainer>,
): Promise<void> {
    const { guid, faceid, offset, count } = req.params;
    const service = res.locals.container.resolve('searchService');
    const result = await service.matchedFaces(guid, faceid, offset, count);
    res.json({ success: true, matches: result });
}

export function searchController(): Router {
    const router = Router({ strict: true, caseSensitive: true });

    router.param('offset', numberParamHandler);
    router.param('count', numberParamHandler);
    router.param('faceid', numberParamHandler);

    router.post('/search', asyncWrapperMiddleware(startSearchHandler));
    router.get(`/search/:guid`, asyncWrapperMiddleware(statusHandler));
    router.get(`/search/:guid/captured`, asyncWrapperMiddleware(capturedFacesHandler));
    router.get(`/search/:guid/matches/:faceid/:offset/:count`, asyncWrapperMiddleware(matchedFacesHandler));

    router.use(uploadErrorHandlerMiddleware);
    router.use(faceXErrorHandlerMiddleware);

    return router;
}
