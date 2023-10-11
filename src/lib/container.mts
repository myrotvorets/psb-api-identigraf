import { AwilixContainer, asFunction, asValue, createContainer } from 'awilix';
import type { NextFunction, Request, Response } from 'express';
import { FaceXClient } from '@myrotvorets/facex';
import { CompareService } from '../services/compare.mjs';
import { SearchService } from '../services/search.mjs';
import { environment } from './environment.mjs';
import { configurator } from './otel.mjs';

export interface Container {
    faceXClient: FaceXClient;
    compareService: CompareService;
    searchService: SearchService;
    environment: ReturnType<typeof environment>;
    logger: ReturnType<(typeof configurator)['logger']>;
    meter: ReturnType<(typeof configurator)['meter']>;
}

export interface RequestContainer {
    req: Request;
}

export const container = createContainer<Container>();

function createEnvironment(): ReturnType<typeof environment> {
    return environment(true);
}

function createLogger({ req }: RequestContainer): ReturnType<(typeof configurator)['logger']> {
    const logger = configurator.logger();
    logger.clearAttributes();
    logger.setAttribute('ip', req.ip);
    logger.setAttribute('request', `${req.method} ${req.url}`);
    return logger;
}

function createMeter(): ReturnType<(typeof configurator)['meter']> {
    return configurator.meter();
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
