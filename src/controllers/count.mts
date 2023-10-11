import { type Request, type Response, Router } from 'express';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { faceXErrorHandlerMiddleware } from '../middleware/error.mjs';
import type { LocalsWithContainer } from '../lib/container.mjs';

interface CountResponse {
    success: true;
    faces: number;
}

async function countHandler(
    _req: Request<never, CountResponse, never, never, LocalsWithContainer>,
    res: Response<CountResponse, LocalsWithContainer>,
): Promise<void> {
    const client = res.locals.container.resolve('faceXClient');
    const r = await client.baseStatus();
    res.json({
        success: true,
        faces: r.numberOfRecords,
    });
}

export function countController(): Router {
    const router = Router();
    router.get('/count', asyncWrapperMiddleware(countHandler));
    router.use(faceXErrorHandlerMiddleware);
    return router;
}
