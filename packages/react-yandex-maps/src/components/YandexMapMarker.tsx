import type { YMapMarker } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../utils/system';
import { getMarkerContainerProps } from '../utils/marker';
import type { YandexMapMarkerPosition } from '../types/marker';
import { useSetupMapChild } from './internal/useSetupMapChild';

export type YandexMapMarkerPropsReact = {
    modelValue?: YMapMarker | null;
    onUpdateModelValue?: (value: YMapMarker) => void;
    settings: ConstructorParameters<typeof YMapMarker>[0];
    position?: YandexMapMarkerPosition;
    containerAttrs?: Record<string, any>;
    wrapperAttrs?: Record<string, any>;
    zeroSizes?: boolean | null;
    children?: React.ReactNode;
};

export function YandexMapMarker({
    onUpdateModelValue,
    settings,
    position,
    containerAttrs,
    wrapperAttrs,
    zeroSizes = null,
    children,
}: YandexMapMarkerPropsReact) {
    const element = React.useRef<HTMLDivElement | null>(null);

    const marker = useSetupMapChild<YMapMarker, never>({
        settings,
        createFunction: () => new ymaps3.YMapMarker(settings, element.current!),
    });

    React.useEffect(() => {
        if (!settings?.coordinates) {
            throwException({
                text: 'You must specify coordinates in YandexMapMarker settings',
            });
        }
    }, [settings]);

    React.useEffect(() => {
        if (marker) onUpdateModelValue?.(marker);
    }, [marker, onUpdateModelValue]);

    // Keep element attached when map engine moves it around.
    const mapParentRef = React.useRef<HTMLElement | null>(null);
    React.useEffect(() => {
        const el = element.current;
        if (!el) return;

        if (!mapParentRef.current && el.parentElement?.closest('ymaps')) {
            mapParentRef.current = el.parentElement;
        }
        else if (mapParentRef.current && el.parentElement && !el.parentElement.closest('ymaps')) {
            mapParentRef.current.appendChild(el);
        }

        if (!el.parentElement?.closest('ymaps')) el.remove();
    });

    const rootProps = React.useMemo(() => getMarkerContainerProps({
        position,
        containerAttrs,
        wrapperAttrs,
        zeroSizes,
    }), [position, containerAttrs, wrapperAttrs, zeroSizes]);

    return (
        <div {...rootProps.root} ref={element} className={`__ymap_marker ${rootProps.root.className ?? ''}`.trim()}>
            <div {...rootProps.children}>
                {children}
            </div>
        </div>
    );
}

