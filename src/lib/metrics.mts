/* c8 ignore start */
import { ValueType } from '@opentelemetry/api';
import { getMeter } from '@myrotvorets/otel-utils';
import type { Container } from './container.mjs';

type AsyncMetricOptions = Pick<Container, 'faceXClient' | 'meter'>;

export function initAsyncMetrics({ meter, faceXClient }: AsyncMetricOptions): void {
    meter
        .createObservableUpDownCounter('facex.faces.count', {
            description: 'Number of stored faces',
            unit: '{count}',
            valueType: ValueType.INT,
        })
        .addCallback(async (result) => {
            try {
                const r = await faceXClient.baseStatus();
                result.observe(r.numberOfRecords);
            } catch {
                result.observe(NaN);
            }
        });
}

export const requestDurationHistogram = getMeter().createHistogram('psbapi.request.duration', {
    description: 'Measures the duration of requests.',
    unit: 'ms',
    valueType: ValueType.DOUBLE,
});

/* c8 ignore stop */
