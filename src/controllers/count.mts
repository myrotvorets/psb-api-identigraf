import { type Request, type RequestHandler, type Response, Router } from 'express';
import type { FaceXClient } from '@myrotvorets/facex';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';

interface CountResponse {
    success: true;
    faces: number;
}

function countHandler(client: FaceXClient): RequestHandler<never, CountResponse, never, never> {
    return asyncWrapperMiddleware(
        async (_req: Request<never, CountResponse, never, never>, res: Response<CountResponse>): Promise<void> => {
            const r = await client.baseStatus();
            res.json({
                success: true,
                faces: r.numberOfRecords,
            });
        },
    );
}

export function countController(client: FaceXClient): Router {
    const router = Router();

    router.get('/count', countHandler(client));
    router.use(faceXErrorHandlerMiddleware);

    return router;
}
