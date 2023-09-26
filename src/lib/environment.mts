import { cleanEnv, num, port, str, url } from 'envalid';

export interface Environment {
    NODE_ENV: string;
    PORT: number;
    FACEX_URL: string;
    IDENTIGRAF_MAX_FILE_SIZE: number;
}

let environ: Environment | null = null;

export function environment(reset = false): Environment {
    if (!environ || reset) {
        environ = cleanEnv(process.env, {
            NODE_ENV: str({ default: 'development' }),
            PORT: port({ default: 3000 }),
            FACEX_URL: url(),
            IDENTIGRAF_MAX_FILE_SIZE: num({ default: 5242880 }),
        });
    }

    return environ;
}
