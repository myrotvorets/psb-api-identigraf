import { mkdtemp } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express, { type Express } from 'express';
import { cleanUploadedFilesMiddleware } from '@myrotvorets/clean-up-after-multer';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { createServer, getTracer, recordErrorToSpan } from '@myrotvorets/otel-utils';

import { initializeContainer, scopedContainerMiddleware } from './lib/container.mjs';
import { initAsyncMetrics } from './lib/metrics.mjs';

import { requestDurationMiddleware } from './middleware/duration.mjs';
import { loggerMiddleware } from './middleware/logger.mjs';
import { uploadErrorHandlerMiddleware } from './middleware/upload.mjs';

import { compareController } from './controllers/compare.mjs';
import { searchController } from './controllers/search.mjs';
import { countController } from './controllers/count.mjs';
import { monitoringController } from './controllers/monitoring.mjs';

export function configureApp(app: Express): Promise<ReturnType<typeof initializeContainer>> {
    return getTracer().startActiveSpan(
        'configureApp',
        async (span): Promise<ReturnType<typeof initializeContainer>> => {
            try {
                const container = initializeContainer();
                const env = container.resolve('environment');
                const base = dirname(fileURLToPath(import.meta.url));

                const tempDir = await mkdtemp(join(tmpdir(), 'identigraf-'));
                process.once('exit', () => rmSync(tempDir, { force: true, recursive: true, maxRetries: 3 }));

                app.use(requestDurationMiddleware, scopedContainerMiddleware, loggerMiddleware);

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
                    errorMiddleware,
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
    const env = container.resolve('environment');

    const server = await createServer(app);
    server.listen(env.PORT);
}
