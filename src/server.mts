import { mkdtemp } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express, { type Express, type Request, type Response } from 'express';
import { cleanUploadedFilesMiddleware } from '@myrotvorets/clean-up-after-multer';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { createServer, getTracer, recordErrorToSpan } from '@myrotvorets/otel-utils';
import {
    type LoggerFromRequestFunction,
    errorLoggerHook,
    requestDurationMiddleware,
    requestLoggerMiddleware,
} from '@myrotvorets/express-otel-middlewares';

import { type LocalsWithContainer, initializeContainer, scopedContainerMiddleware } from './lib/container.mjs';
import { initAsyncMetrics, requestDurationHistogram } from './lib/metrics.mjs';

import { uploadErrorHandlerMiddleware } from './middleware/upload.mjs';

import { compareController } from './controllers/compare.mjs';
import { searchController } from './controllers/search.mjs';
import { countController } from './controllers/count.mjs';
import { monitoringController } from './controllers/monitoring.mjs';

const loggerFromRequest: LoggerFromRequestFunction = (req: Request) =>
    (req.res as Response<never, LocalsWithContainer> | undefined)?.locals.container.resolve('logger');

export function configureApp(app: Express): Promise<ReturnType<typeof initializeContainer>> {
    return getTracer().startActiveSpan(
        'configureApp',
        async (span): Promise<ReturnType<typeof initializeContainer>> => {
            try {
                const container = initializeContainer();
                const env = container.resolve('environment');
                const base = dirname(fileURLToPath(import.meta.url));

                const tempDir = await mkdtemp(join(tmpdir(), 'identigraf-'));
                process.once('beforeExit', () => rmSync(tempDir, { force: true, recursive: true, maxRetries: 3 }));

                app.use(
                    requestDurationMiddleware(requestDurationHistogram),
                    scopedContainerMiddleware,
                    requestLoggerMiddleware('identigraf', loggerFromRequest),
                );

                app.use('/monitoring', monitoringController());

                app.use(
                    installOpenApiValidator(join(base, 'specs', 'identigraf-private.yaml'), env.NODE_ENV, {
                        validateRequests: {
                            coerceTypes: true,
                        },
                        fileUploader: {
                            dest: tempDir,
                            limits: {
                                fileSize: env.IDENTIGRAF_MAX_FILE_SIZE,
                            },
                        },
                    }),
                    countController(),
                    compareController(),
                    searchController(),
                    notFoundMiddleware,
                    cleanUploadedFilesMiddleware(),
                    uploadErrorHandlerMiddleware,
                    errorMiddleware({
                        beforeSendHook: errorLoggerHook(loggerFromRequest),
                    }),
                );

                initAsyncMetrics(container.cradle);
                return container;
            } /* c8 ignore start */ catch (e) {
                recordErrorToSpan(e, span);
                throw e;
            } /* c8 ignore stop */ finally {
                span.end();
            }
        },
    );
}

export function createApp(): Express {
    const app = express();
    app.set('strict routing', true);
    app.set('case sensitive routing', true);
    app.set('x-powered-by', false);
    app.set('trust proxy', true);
    return app;
}

export async function run(): Promise<void> {
    const app = createApp();
    const container = await configureApp(app);
    const server = await createServer(app);
    server.on('close', () => {
        container.dispose().catch((e: unknown) => console.error(e));
    });
}
