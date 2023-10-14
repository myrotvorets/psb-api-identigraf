import { AwilixContainer, asFunction, asValue, createContainer } from 'awilix';
import type { NextFunction, Request, Response } from 'express';
import { type Logger, type Meter, getLogger, getMeter } from '@myrotvorets/otel-utils';
import { FaceXClient } from '@myrotvorets/facex';
import { CompareService } from '../services/compare.mjs';
import { SearchService } from '../services/search.mjs';
import { environment } from './environment.mjs';

export interface Container {
    faceXClient: FaceXClient;
    compareService: CompareService;
    searchService: SearchService;
    environment: ReturnType<typeof environment>;
    logger: Logger;
    meter: Meter;
}

export interface RequestContainer {
    req: Request;
}

export const container = createContainer<Container>();

function createEnvironment(): ReturnType<typeof environment> {
    return environment(true);
}

function createLogger({ req }: RequestContainer): Logger {
    const logger = getLogger();
    logger.clearAttributes();
    logger.setAttribute('ip', req.ip);
    logger.setAttribute('request', `${req.method} ${req.url}`);
    return logger;
}

function createMeter(): Meter {
    return getMeter();
}

function createFaceXClient({ environment }: Container): FaceXClient {
    return new FaceXClient(environment.FACEX_URL, 'facex/node-2.0');
}

function createCompareService({ faceXClient }: Container): CompareService {
    return new CompareService(faceXClient);
}

function createSearchService({ faceXClient }: Container): SearchService {
    return new SearchService(faceXClient);
}

export type LocalsWithContainer = Record<'container', AwilixContainer<RequestContainer & Container>>;

export function initializeContainer(): typeof container {
    container.register({
        faceXClient: asFunction(createFaceXClient).singleton(),
        compareService: asFunction(createCompareService).singleton(),
        searchService: asFunction(createSearchService).singleton(),
        environment: asFunction(createEnvironment).singleton(),
        logger: asFunction(createLogger).scoped(),
        meter: asFunction(createMeter).singleton(),
    });

    return container;
}

export function scopedContainerMiddleware(
    req: Request,
    res: Response<unknown, LocalsWithContainer>,
    next: NextFunction,
): void {
    res.locals.container = container.createScope<RequestContainer>();
    res.locals.container.register({
        req: asValue(req),
    });

    next();
}
