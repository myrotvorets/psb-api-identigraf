import { mkdtemp } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express, { type Express, static as staticMiddleware } from 'express';
import morgan from 'morgan';
import { cleanUploadedFilesMiddleware } from '@myrotvorets/clean-up-after-multer';
import { createServer } from '@myrotvorets/create-server';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { FaceXClient } from '@myrotvorets/facex';
import { uploadErrorHandlerMiddleware } from './middleware/upload.mjs';

import { environment } from './lib/environment.mjs';

import { compareController } from './controllers/compare.mjs';
import { searchController } from './controllers/search.mjs';
import { countController } from './controllers/count.mjs';
import { monitoringController } from './controllers/monitoring.mjs';

export async function configureApp(app: Express): Promise<void> {
    const env = environment();
    const client = new FaceXClient(env.FACEX_URL, 'facex/node-2.0');

    /* c8 ignore start */
    if (env.NODE_ENV !== 'production') {
        app.use(
            '/specs/',
            staticMiddleware(join(dirname(fileURLToPath(import.meta.url)), 'specs'), {
                acceptRanges: false,
                index: false,
            }),
        );

        if (process.env.HAVE_SWAGGER === 'true') {
            app.get('/', (_req, res) => res.redirect('/swagger/'));
        }
    }
    /* c8 ignore end */

    const tempDir = await mkdtemp(join(tmpdir(), 'identigraf-'));
    process.once('exit', () => rmSync(tempDir, { force: true, recursive: true, maxRetries: 3 }));

    await installOpenApiValidator(
        join(dirname(fileURLToPath(import.meta.url)), 'specs', 'identigraf-private.yaml'),
        app,
        env.NODE_ENV,
        {
            validateRequests: {
                coerceTypes: true,
            },
            fileUploader: {
                dest: tempDir,
                limits: {
                    fileSize: env.IDENTIGRAF_MAX_FILE_SIZE,
                },
            },
        },
    );

    app.use(
        countController(client),
        compareController(client),
        searchController(client),
        notFoundMiddleware,
        cleanUploadedFilesMiddleware(),
        uploadErrorHandlerMiddleware,
        errorMiddleware,
    );
}

/* c8 ignore start */
export function setupApp(): Express {
    const app = express();
    app.set('strict routing', true);
    app.set('x-powered-by', false);

    app.use(
        morgan(
            '[PSBAPI-identigraf] :req[X-Request-ID]\t:method\t:url\t:req[content-length]\t:status :res[content-length]\t:date[iso]\t:response-time\t:total-time',
        ),
    );

    return app;
}

export async function run(): Promise<void> {
    const [env, app] = [environment(), setupApp()];

    app.use('/monitoring', monitoringController());

    await configureApp(app);

    const server = await createServer(app);
    server.listen(env.PORT);
}
/* c8 ignore end */
