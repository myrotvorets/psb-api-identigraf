/* c8 ignore start */
import { ValueType } from '@opentelemetry/api';
import { OpenTelemetryConfigurator, getExpressInstrumentations } from '@myrotvorets/opentelemetry-configurator';

if (!+(process.env.ENABLE_TRACING || 0)) {
    process.env.OTEL_SDK_DISABLED = 'true';
}

export const configurator = new OpenTelemetryConfigurator({
    serviceName: 'psb-api-identigraf',
    instrumentations: [...getExpressInstrumentations()],
});

export const requestDurationHistogram = configurator.meter().createHistogram('psbapi.request.duration', {
    description: 'Measures the duration of requests.',
    unit: 'ms',
    valueType: ValueType.DOUBLE,
});

configurator.start();
/* c8 ignore stop */
