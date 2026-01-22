import type { Projection } from '@yandex/ymaps3-types/common/types';
import type { YMap, YMapEntity } from '@yandex/ymaps3-types';
import React from 'react';
import { diff } from 'deep-object-diff';
import { copy, excludeKeys, throwException } from '../../utils/system';
import { useYandexMapContext, useYandexMapRootContextOptional } from './contexts';
import { deleteMapChildren } from './deleteMapChildren';
import { waitTillMapInit, waitTillYmapInit } from './wait';

type RequiredImport<R> = (() => Promise<R>) | undefined;

export type SetupMapChildOptions<T extends YMapEntity<unknown> | Projection, R> = {
    returnOnly?: boolean;
    willDeleteByHand?: boolean;
    strictMapRoot?: boolean;

    requiredImport?: RequiredImport<R>;
    createFunction: (neededImport: R) => T;

    settings?: Record<string, any> | undefined;
    settingsUpdateIgnoreKeys?: string[] | undefined;
    settingsUpdateFull?: boolean;

    isLayer?: boolean;
    isProjection?: boolean;
    index?: number | undefined;
};

function getAttachRoot({
    map,
    mapRoot,
}: {
    map: YMap | null;
    mapRoot: ReturnType<typeof useYandexMapRootContextOptional>;
}): YMap | any[] | null {
    if (mapRoot?.root) return mapRoot.root as any;
    return map as any;
}

export function useSetupMapChild<T extends YMapEntity<unknown> | Projection, R = any>(
    options: SetupMapChildOptions<T, R>,
): T | undefined {
    const {
        map,
        subscribeMap,
        addLayer,
        removeLayer,
        setProjection,
    } = useYandexMapContext();
    const mapRoot = useYandexMapRootContextOptional();
    const mapRef = React.useRef<YMap | null>(map);
    React.useEffect(() => {
        mapRef.current = map;
    }, [map]);

    const childRef = React.useRef<T | undefined>(undefined);
    const lastSettingsRef = React.useRef<Record<string, any> | undefined>(undefined);

    const optionsRef = React.useRef(options);
    optionsRef.current = options;

    // init + attach
    React.useEffect(() => {
        let cancelled = false;
        let timeouts: Set<ReturnType<typeof setTimeout>> | null = null;

        const timeoutCallback = (timeout: ReturnType<typeof setTimeout>, isDelete: boolean) => {
            if (!timeouts) timeouts = new Set();
            if (!isDelete) timeouts.add(timeout);
            else timeouts.delete(timeout);
        };

        const run = async () => {
            const {
                returnOnly,
                strictMapRoot,
                requiredImport,
                createFunction,
                isLayer,
                isProjection,
                index,
            } = optionsRef.current;

            if (!isLayer && !isProjection) {
                await waitTillMapInit({
                    getMap: () => mapRef.current,
                    subscribeMap,
                    timeoutCallback,
                });
                if (!mapRef.current) {
                    throwException({
                        text: 'map is undefined in useSetupMapChild. Please verify that Yandex Maps were initialized successfully and you only use components inside <YandexMap>.',
                    });
                }
            }
            else {
                await waitTillYmapInit({ timeoutCallback });
            }

            if (strictMapRoot) {
                if (!mapRoot?.root) {
                    throwException({
                        text: `mapRoot is undefined in useSetupMapChild. Please verify that you are using component inside it's root: for example, don't use Controls outside <YandexMapControls>.`,
                    });
                }
            }

            let importData: any = undefined;
            if (requiredImport) {
                const importPromise = requiredImport();
                if (mapRoot?.initPromises.current) mapRoot.initPromises.current.push(Promise.resolve(importPromise));
                importData = await importPromise;
            }

            if (cancelled) return;
            const created = createFunction(importData as R);
            childRef.current = created;

            // Attach
            if (!returnOnly && !isProjection) {
                const root = getAttachRoot({ map: mapRef.current, mapRoot });
                if (!root) return;

                if (Array.isArray(root)) {
                    const idx = typeof index === 'number' ? index : root.length;
                    root.splice(idx, 0, created as any);
                }
                else {
                    (root as any).addChild(created as any, index);
                }
            }
            else if (isLayer) {
                addLayer(created as any);
            }
            else if (isProjection && mapRef.current) {
                setProjection(created as unknown as Projection);
            }
        };

        run().catch(e => {
            // don't swallow
            console.error('Error during map children loading', e);
        });

        return () => {
            cancelled = true;
            const child = childRef.current;
            const {
                returnOnly,
                willDeleteByHand,
                isLayer,
                isProjection,
            } = optionsRef.current;

            if (!returnOnly && !willDeleteByHand && child) {
                if (isLayer) {
                    removeLayer(child as any);
                }
                else {
                    const root = getAttachRoot({ map: mapRef.current, mapRoot });
                    deleteMapChildren({
                        children: child as any,
                        isMercator: isProjection,
                        root: root as any,
                    });
                }
            }

            if (timeouts?.size) {
                timeouts.forEach(t => clearTimeout(t));
                timeouts.clear();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // settings update
    React.useEffect(() => {
        const {
            settings,
            settingsUpdateIgnoreKeys,
            settingsUpdateFull,
        } = options;

        if (!settings) return;
        const child = childRef.current;
        if (!child || !('update' in (child as any))) return;

        if (!lastSettingsRef.current) {
            lastSettingsRef.current = copy(settings);
            return;
        }

        if (settingsUpdateFull) {
            (child as any).update(settings);
            lastSettingsRef.current = copy(settings);
            return;
        }

        const lastSettings = lastSettingsRef.current;
        const settingsDiff = Object.keys(diff(lastSettings, settings));
        if (settingsDiff.length === 0) return;

        const updatedSettings = copy(settings);
        for (const key in updatedSettings) {
            if (!settingsDiff.includes(key)) delete (updatedSettings as any)[key];
        }

        if (settingsUpdateIgnoreKeys) excludeKeys(updatedSettings, settingsUpdateIgnoreKeys);
        if (Object.keys(updatedSettings).length === 0) return;

        lastSettingsRef.current = copy(settings);
        (child as any).update(updatedSettings);
    }, [options.settings, options.settingsUpdateFull, options.settingsUpdateIgnoreKeys]);

    // index update
    React.useEffect(() => {
        const { index, returnOnly, isProjection } = options;
        if (returnOnly || isProjection) return;

        const child = childRef.current;
        const root = getAttachRoot({ map: mapRef.current, mapRoot });
        if (!child || !root) return;

        // re-attach at new index
        try {
            deleteMapChildren({
                children: child as any,
                isMercator: false,
                root: root as any,
            });
        }
        catch {
            // ignore non-fatal
        }

        if (Array.isArray(root)) {
            const idx = typeof index === 'number' ? index : root.length;
            root.splice(idx, 0, child as any);
        }
        else {
            (root as any).addChild(child as any, index);
        }
    }, [options.index]);

    return childRef.current;
}

