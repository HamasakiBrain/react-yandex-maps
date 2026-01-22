import type { YMap } from '@yandex/ymaps3-types';
import { YandexMapException, yandexMapLoadError, yandexMapLoadStatus, yandexMapSettings } from '../../utils/init';

export async function waitTillYmapInit({
    timeoutCallback,
    waitDuration,
}: {
    timeoutCallback?: (timeout: ReturnType<typeof setTimeout>, isDelete: boolean) => any;
    waitDuration?: number | boolean;
} = {}): Promise<void> {
    if (typeof window === 'undefined') {
        throw new YandexMapException('waitTillYmapInit cannot be called on SSR.');
    }

    if (typeof ymaps3 !== 'undefined') return;

    return new Promise<void>((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;

        waitDuration = typeof waitDuration !== 'undefined' ? waitDuration : yandexMapSettings.value.mapsScriptWaitDuration;

        if (waitDuration !== false) {
            timeout = setTimeout(() => {
                timeoutCallback?.(timeout!, true);
                reject(new YandexMapException('Was not able to wait for map initialization in waitTillYmapInit. Ensure that map was initialized. You can change this behavior by using mapsScriptWaitDuration.'));
            }, typeof waitDuration === 'number' ? waitDuration : 5000);
            timeoutCallback?.(timeout, false);
        }

        const interval = setInterval(() => {
            if (typeof ymaps3 !== 'undefined') {
                if (timeout) {
                    clearTimeout(timeout);
                    timeoutCallback?.(timeout, true);
                }
                clearInterval(interval);

                if (yandexMapLoadStatus.value === 'loaded') resolve();
                else reject(yandexMapLoadError.value);
            }
        }, 16);
    });
}

export async function waitTillMapInit({
    getMap,
    subscribeMap,
    timeoutCallback,
    waitDuration,
}: {
    getMap: () => YMap | null;
    subscribeMap: (listener: () => void) => () => void;
    timeoutCallback?: (timeout: ReturnType<typeof setTimeout>, isDelete: boolean) => any;
    waitDuration?: number | boolean;
}): Promise<void> {
    if (typeof window === 'undefined') {
        throw new YandexMapException('waitTillMapInit cannot be called on SSR.');
    }

    if (getMap()) return;

    return new Promise<void>((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        waitDuration = typeof waitDuration !== 'undefined' ? waitDuration : yandexMapSettings.value.mapsRenderWaitDuration;

        if (waitDuration !== false) {
            timeout = setTimeout(() => {
                timeoutCallback?.(timeout!, true);
                reject(new YandexMapException('Was not able to wait for map initialization in waitTillMapInit. You can change this behavior by using mapsRenderWaitDuration.'));
            }, typeof waitDuration === 'number' ? waitDuration : 5000);
            timeoutCallback?.(timeout, false);
        }

        const unsubscribe = subscribeMap(() => {
            if (getMap()) {
                unsubscribe();
                if (timeout) {
                    clearTimeout(timeout);
                    timeoutCallback?.(timeout, true);
                }
                resolve();
            }
        });

        // immediate
        if (getMap()) {
            unsubscribe();
            if (timeout) {
                clearTimeout(timeout);
                timeoutCallback?.(timeout, true);
            }
            resolve();
        }
    });
}

