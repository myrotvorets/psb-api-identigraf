/* c8 ignore start */
import { getMeter } from '@myrotvorets/otel-utils';
import { ValueType } from '@opentelemetry/api';

export const requestDurationHistogram = getMeter().createHistogram('psbapi.request.duration', {
    description: 'Measures the duration of requests.',
    unit: 'ms',
    valueType: ValueType.DOUBLE,
});

/* c8 ignore stop */
