import type { Apikeys } from '@yandex/ymaps3-types/imperative/config';
import type { YMapEntity } from '@yandex/ymaps3-types';
import type { OverloadParameters } from '../types/overload-extract';

export type RefLike<T> = { value: T };
export type ComputedLike<T> = { readonly value: T };

export function refLike<T>(value: T): RefLike<T> {
    return { value };
}

export function computedLike<T>(getter: () => T): ComputedLike<T> {
    return {
        get value() {
            return getter();
        },
    };
}

export interface IYandexMapTrafficLayerProps {
    visible: boolean;
    [key: string]: any;
}

// Runtime classes are provided by '@yandex/ymaps3-layers-extra' module.
// These declarations exist purely for typing.
export type IYandexMapTrafficLayer = YMapEntity<IYandexMapTrafficLayerProps>;

export interface IYandexMapTrafficEventsLayerProps extends IYandexMapTrafficLayerProps {}

export type IYandexMapTrafficEventsLayer = YMapEntity<IYandexMapTrafficEventsLayerProps>;

export class YandexMapException extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'YandexMapException';
    }
}

export type YandexMapLoadStatus = 'pending' | 'loading' | 'loaded' | 'error';

export interface YandexMapLayersExtra {
    YMapTrafficLayer: any;
    YMapTrafficEventsLayer: any;
}

/**
 * @description type-safe import for layers-extra module
 * @internal
 */
export function importLayersExtra() {
    // '@yandex/ymaps3-layers-extra' может отсутствовать в типах ymaps3.import, поэтому уводим в any.
    return (ymaps3.import as any)('@yandex/ymaps3-layers-extra') as Promise<YandexMapLayersExtra>;
}

export interface YandexMapPluginSettings {
    /**
     * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/load.html#parms
     * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/load.html#parms
     */
    apikey: string;
    /**
     * @description Allows to set apikeys for Yandex Services.
     *
     * @note You should only set those on first setup. Will have no effect afterward.
     * @example router for `ymaps3.route` and `suggest` for `ymaps3.suggest`
     */
    servicesApikeys?: Apikeys | null;
    /**
     * @default ru_RU
     */
    lang?: string;
    /**
     * @default v3
     */
    version?: string;
    /**
     * @default false
     */
    strictMode?: boolean;
    cdnLibraryLoading?: {
        enabled?: boolean;
        url?: string;
        extendLibraries?: string[];
    };
    /**
     * @default https://api-maps.yandex.ru
     */
    domain?: string;
    /**
     * @default onComponentMount
     */
    initializeOn?: 'onPluginInit' | 'onComponentMount' | 'never';
    /**
     * @description You can preload modules in initYmaps, note you will still have to import them later to use
     */
    importModules?: OverloadParameters<typeof ymaps3['import']>[0][];
    /**
     * @default true (5000)
     */
    mapsScriptWaitDuration?: number | boolean;
    /**
     * @default true (5000)
     */
    mapsRenderWaitDuration?: number | boolean;
    /**
     * @default async defer referrerpolicy=strict-origin-when-cross-origin type=text/javascript
     * @note src will be ignored
     */
    scriptAttributes?: Record<Lowercase<string>, string | false>;
}

/**
 * @description Strict-typed version of PluginSettings with all keys required
 */
export type DefProductSettings = {
    [T in keyof YandexMapPluginSettings]-?: YandexMapPluginSettings[T]
};

export const yandexMapSettings: RefLike<YandexMapPluginSettings> = refLike({
    apikey: '',
});

/**
 * @description True when `createYmapsOptions` was called and settings were set
 */
export const isYandexMapReadyToInit: ComputedLike<boolean> = computedLike(() => !!yandexMapSettings.value.apikey);

// Type-safe ymaps3 to avoid "never" problems with undefined checks
export const yandexMapYmaps3 = () => ymaps3;
export const yandexMapScript: RefLike<HTMLElement | null> = refLike(null);

export const yandexMapLoadStatus: RefLike<YandexMapLoadStatus> = refLike('pending');
export const yandexMapIsLoaded: ComputedLike<boolean> = computedLike(() => yandexMapLoadStatus.value === 'loaded' || yandexMapLoadStatus.value === 'error');
export const yandexMapLoadError: RefLike<null | Error | Parameters<OnErrorEventHandlerNonNull>[0]> = refLike(null);

