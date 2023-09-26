import { type Request, type RequestHandler, type Response, Router } from 'express';
import type { FaceXClient, SearchStats } from '@myrotvorets/facex';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { type MatchedFace, type RecoginizedFace, SearchService } from '../services/search.mjs';
import { uploadErrorHandlerMiddleware } from '../middleware/upload.mjs';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';

interface StartSearchRequest {
    minSimilarity: number;
}

interface StartSearchResponse {
    success: true;
    guid: string;
}

function startSearchHandler(
    service: SearchService,
): RequestHandler<never, StartSearchResponse, StartSearchRequest, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<never, StartSearchResponse, StartSearchRequest, never>,
            res: Response<StartSearchResponse>,
        ): Promise<void> => {
            const guid = await service.upload((req.files as Express.Multer.File[])[0], req.body.minSimilarity ?? 0);
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
          stats: SearchStats[];
      };

function statusHandler(service: SearchService): RequestHandler<StatusParams, StatusResponse, never, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<StatusParams, StatusResponse, never, never>,
            res: Response<StatusResponse>,
        ): Promise<void> => {
            const { guid } = req.params;
            const result = await service.status(guid);
            if (false === result) {
                res.json({ success: true, status: 'inprogress' });
            } else {
                res.json({ success: true, status: 'complete', stats: result });
            }
        },
    );
}

interface CapturedFacesResponse {
    success: true;
    faces: RecoginizedFace[];
}

function capturedFacesHandler(
    service: SearchService,
): RequestHandler<StatusParams, CapturedFacesResponse, never, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<StatusParams, CapturedFacesResponse, never, never>,
            res: Response<CapturedFacesResponse>,
        ): Promise<void> => {
            const { guid } = req.params;
            const result = await service.recognizedFaces(guid);
            res.json({ success: true, faces: result });
        },
    );
}

interface MatchedFacesParams {
    guid: string;
    faceid: string;
    offset: string;
    count: string;
}

interface MatchedFacesResponse {
    success: true;
    matches: MatchedFace[];
}

function matchedFacesHandler(
    service: SearchService,
): RequestHandler<MatchedFacesParams, MatchedFacesResponse, never, never> {
    return asyncWrapperMiddleware(
        async (
            req: Request<MatchedFacesParams, MatchedFacesResponse, never, never>,
            res: Response<MatchedFacesResponse>,
        ): Promise<void> => {
            const { guid } = req.params;
            const faceid = parseInt(req.params.faceid, 10);
            const offset = parseInt(req.params.offset, 10);
            const count = parseInt(req.params.count, 10);
            const result = await service.matchedFaces(guid, faceid, offset, count);
            res.json({ success: true, matches: result });
        },
    );
}

export function searchController(client: FaceXClient): Router {
    const router = Router();
    const service = new SearchService(client);

    const guidPattern = '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}';

    router.post('/search', startSearchHandler(service));
    router.get(`/search/:guid(${guidPattern})`, statusHandler(service));
    router.get(`/search/:guid(${guidPattern})/captured`, capturedFacesHandler(service));
    router.get(`/search/:guid(${guidPattern})/matches/:faceid/:offset/:count`, matchedFacesHandler(service));

    router.use(uploadErrorHandlerMiddleware);
    router.use(faceXErrorHandlerMiddleware);

    return router;
}
