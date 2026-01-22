import type { LngLat, YMap, YMapEntity, YMapListener, YMapProps } from '@yandex/ymaps3-types';
import type { Projection } from '@yandex/ymaps3-types/common/types';
import React from 'react';
import { diff } from 'deep-object-diff';
import { initYmaps } from '../functions';
import { copy, throwException } from '../utils/system';
import { yandexMapIsLoaded, yandexMapLoadStatus, yandexMapScript, yandexMapSettings } from '../utils/init';
import { YandexMapContext } from './internal/contexts';
import { waitTillMapInit } from './internal/wait';

export type YandexMapSettings = Omit<YMapProps, 'projection'>;

export type YandexMapPropsReact = {
    modelValue?: YMap | null;
    onUpdateModelValue?: (value: YMap | null) => void;
    tag?: keyof React.JSX.IntrinsicElements;
    width?: string;
    height?: string;
    zIndex?: number;
    settings: YandexMapSettings;
    readonlySettings?: boolean;
    realSettingsLocation?: boolean;
    layers?: YMapEntity<unknown>[];
    cursorGrab?: boolean;
    children?: React.ReactNode;
};

export function YandexMap({
    onUpdateModelValue,
    tag = 'div',
    width = '100%',
    height = '100%',
    zIndex = 0,
    settings,
    readonlySettings = false,
    realSettingsLocation = false,
    layers = [],
    cursorGrab = false,
    children,
}: YandexMapPropsReact) {
    const Tag = tag as any;
    const mapRef = React.useRef<HTMLDivElement | null>(null);
    const ymapContainer = React.useRef<HTMLDivElement | null>(null);

    const [map, setMapState] = React.useState<YMap | null>(null);
    const mapStateRef = React.useRef<YMap | null>(null);
    const mapListenersRef = React.useRef(new Set<() => void>());

    const subscribeMap = React.useCallback((listener: () => void) => {
        mapListenersRef.current.add(listener);
        return () => mapListenersRef.current.delete(listener);
    }, []);

    const setMap = React.useCallback((next: YMap | null) => {
        setMapState(next);
        mapStateRef.current = next;
        onUpdateModelValue?.(next);
        mapListenersRef.current.forEach(fn => fn());
    }, [onUpdateModelValue]);

    const [childrenMounted, setChildrenMounted] = React.useState(false);
    const [holdCount, setHoldCount] = React.useState(0);
    const [mapLayers, setMapLayers] = React.useState<YMapEntity<unknown>[]>([]);
    const [projection, setProjection] = React.useState<Projection | null>(null);

    const incHold = React.useCallback(() => setHoldCount(x => x + 1), []);
    const decHold = React.useCallback(() => setHoldCount(x => Math.max(0, x - 1)), []);

    const addLayer = React.useCallback((layer: YMapEntity<unknown>) => {
        setMapLayers(prev => [...prev, layer]);
    }, []);
    const removeLayer = React.useCallback((layer: YMapEntity<unknown>) => {
        setMapLayers(prev => prev.filter(x => x !== layer));
    }, []);

    // init ymaps script
    React.useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (yandexMapIsLoaded.value && yandexMapScript.value && !yandexMapScript.value.parentElement) {
                yandexMapLoadStatus.value = 'pending';
                yandexMapScript.value.remove();
                yandexMapScript.value = null;
            }

            if (!yandexMapIsLoaded.value) {
                const initializeOn = yandexMapSettings.value.initializeOn ?? 'onComponentMount';
                if (initializeOn === 'onComponentMount') {
                    await initYmaps();
                }
                else if (yandexMapLoadStatus.value === 'loading' || initializeOn === 'onPluginInit') {
                    await initYmaps();
                }

                if (!yandexMapIsLoaded.value) {
                    throwException({
                        text: 'You have set up <YandexMap> component without initializing Yandex maps. Please check initializeOn setting or call initYmaps manually before rendering this component.',
                    });
                }
            }

            if (!cancelled) setChildrenMounted(true);
        };

        run().catch(e => {
            console.error('An error occured while initializing Yandex Map', e);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    // create/destroy map
    React.useEffect(() => {
        if (!childrenMounted) return;
        if (holdCount) return;
        if (!ymapContainer.current) return;
        if (typeof ymaps3 === 'undefined') return;

        if (!settings.location) {
            throwException({
                text: 'You must specify location in YandexMap settings',
            });
        }

        // destroy old
        if (map) map.destroy();

        const initSettings: YMapProps = {
            ...(settings as any),
            projection: undefined,
        };
        if (projection) initSettings.projection = projection;

        const next = new ymaps3.YMap(ymapContainer.current, initSettings, [
            ...mapLayers,
            ...layers,
        ]);

        setMap(next);

        return () => {
            next.destroy();
            setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childrenMounted, holdCount]);

    // reactive map.update(settings)
    const lastSettingsRef = React.useRef<YMapProps | null>(null);
    React.useEffect(() => {
        if (!map) return;
        if (readonlySettings) return;

        const current: YMapProps = {
            ...(settings as any),
            projection: undefined,
        };

        if (!lastSettingsRef.current) {
            lastSettingsRef.current = copy(current);
            return;
        }

        const cloned = copy(current);
        const last = lastSettingsRef.current;

        // Handling location change
        if (realSettingsLocation && (cloned as any).location) {
            const clonedLoc = (cloned as any).location;
            const lastLoc = (last as any).location;
            if (clonedLoc && lastLoc) {
                if ('center' in clonedLoc && 'center' in lastLoc) {
                    (lastLoc as any).center = map.center as LngLat;
                }
                else if ('bounds' in clonedLoc && 'bounds' in lastLoc) {
                    (lastLoc as any).bounds = map.bounds;
                }
                if ('zoom' in clonedLoc && 'zoom' in lastLoc) (lastLoc as any).zoom = map.zoom;
            }
        }

        const settingsDiff = Object.keys(diff(last, cloned));
        if (settingsDiff.length === 0) return;

        const updatedSettings: any = { ...cloned };
        for (const key in updatedSettings) {
            if (!settingsDiff.includes(key)) delete updatedSettings[key];
        }

        lastSettingsRef.current = cloned;
        map.update(updatedSettings);
    }, [map, settings, readonlySettings, realSettingsLocation]);

    // cursor grabbing
    const cursorListenerRef = React.useRef<YMapListener | null>(null);
    React.useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const run = async () => {
            await waitTillMapInit({
                getMap: () => mapStateRef.current,
                subscribeMap,
                timeoutCallback: (_t, isDelete) => {
                    if (isDelete) timeout = null;
                    else timeout = _t;
                },
            }).catch(() => {});
            if (!mapStateRef.current) return;

            if (cursorGrab) {
                cursorListenerRef.current = new ymaps3.YMapListener({
                    onActionStart: (e: any) => {
                        if (e.type === 'drag' && cursorGrab) mapRef.current?.classList.add('__ymap--grabbing');
                    },
                    onActionEnd: (e: any) => {
                        if (e.type === 'drag') mapRef.current?.classList.remove('__ymap--grabbing');
                    },
                });
                mapStateRef.current.addChild(cursorListenerRef.current as any);
            }
            else if (cursorListenerRef.current) {
                mapStateRef.current.removeChild(cursorListenerRef.current as any);
                cursorListenerRef.current = null;
            }
        };

        run().catch(() => {});

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [map, cursorGrab, subscribeMap]);

    const ctxValue = React.useMemo(() => ({
        map,
        setMap,
        subscribeMap,
        layers: mapLayers,
        addLayer,
        removeLayer,
        projection,
        setProjection,
        holdCount,
        incHold,
        decHold,
    }), [map, setMap, subscribeMap, mapLayers, addLayer, removeLayer, projection, holdCount, incHold, decHold]);

    return (
        <YandexMapContext.Provider value={ctxValue}>
            <Tag
                ref={mapRef}
                className={`__ymap${cursorGrab ? ' __ymap--grab' : ''}`}
                style={{ width, height, zIndex }}
            >
                <div ref={ymapContainer} className="__ymap_container" />
                {childrenMounted ? (
                    <div style={{ display: 'none' }}>
                        {children}
                    </div>
                ) : null}
            </Tag>
        </YandexMapContext.Provider>
    );
}

