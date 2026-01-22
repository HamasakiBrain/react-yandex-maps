import { YandexMapException } from './init';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function copy<T, K = T>(target: T): K {
    // Array copy
    if (Array.isArray(target)) return target.map(i => copy(i)) as unknown as K;

    // Ignore functions, classes, raw values
    if (!target || typeof target !== 'object' || (target?.constructor !== undefined && target?.constructor !== Object)) return target as unknown as K;

    // Objects copy
    return Object.keys(target)
        .reduce((carry, key) => {
            const val = (target as any)[key];
            (carry as any)[key] = copy(val);
            return carry;
        }, {} as K);
}

export function isDev() {
    return typeof process !== 'undefined' && (process.env?.NODE_ENV === 'development' || (process as any).dev);
}

interface ThrowExceptionSettings {
    text: string;
    isInternal?: boolean;
    warn?: boolean;
}

export function getException({
    text,
    isInternal,
    warn,
}: ThrowExceptionSettings): YandexMapException {
    if (warn) {
        text = `Warning: ${ text }`;
    }

    if (isInternal) {
        text += ' This is likely React Yandex Maps internal bug.';

        if (isDev()) {
            text += ' You can report this bug here: https://github.com/yandex-maps-unofficial/vue-yandex-maps/issues/new/choose';
        }
    }

    return new YandexMapException(text);
}

export function throwException(settings: Omit<ThrowExceptionSettings, 'warn'> & { warn: true }): void;
export function throwException(settings: Omit<ThrowExceptionSettings, 'warn'> & { warn?: false }): never;
export function throwException(settings: ThrowExceptionSettings): never | void {
    const exception = getException(settings);

    if (settings.warn) {
        console.warn(exception);
    }
    else {
        throw exception;
    }
}

export function excludeKeys(item: Record<string, any>, ignoreKeys: string[]) {
    for (const [key, value] of Object.entries(item)) {
        if (ignoreKeys.includes(key)) delete item[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            excludeKeys(value, ignoreKeys);
            if (!Object.keys(value).length) delete item[key];
        }
    }
}

