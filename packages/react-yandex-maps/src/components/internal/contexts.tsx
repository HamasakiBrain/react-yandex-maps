import type { Projection } from '@yandex/ymaps3-types/common/types';
import type { YMap, YMapEntity, YMapGroupEntity } from '@yandex/ymaps3-types';
import React from 'react';

export type MapSubscribe = (listener: () => void) => () => void;

export type YandexMapContextValue = {
    map: YMap | null;
    setMap: (map: YMap | null) => void;
    subscribeMap: MapSubscribe;

    layers: YMapEntity<unknown>[];
    addLayer: (layer: YMapEntity<unknown>) => void;
    removeLayer: (layer: YMapEntity<unknown>) => void;

    projection: Projection | null;
    setProjection: (projection: Projection | null) => void;

    holdCount: number;
    incHold: () => void;
    decHold: () => void;
};

export const YandexMapContext = React.createContext<YandexMapContextValue | null>(null);

export type MapRoot = YMap | YMapGroupEntity<any> | YMapEntity<unknown>[];

export type YandexMapRootContextValue = {
    root: MapRoot | null;
    initPromises: React.MutableRefObject<PromiseLike<any>[]>;
};

export const YandexMapRootContext = React.createContext<YandexMapRootContextValue | null>(null);

export function useYandexMapContext(): YandexMapContextValue {
    const ctx = React.useContext(YandexMapContext);
    if (!ctx) {
        throw new Error('YandexMapContext is missing. Ensure you use components inside <YandexMap>.');
    }
    return ctx;
}

export function useYandexMapRootContextOptional(): YandexMapRootContextValue | null {
    return React.useContext(YandexMapRootContext);
}

