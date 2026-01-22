import type { YMapDefaultSchemeLayer } from '@yandex/ymaps3-types';
import React from 'react';
import { useYandexMapContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapDefaultSchemeLayerPropsReact = {
    modelValue?: YMapDefaultSchemeLayer | null;
    onUpdateModelValue?: (value: YMapDefaultSchemeLayer) => void;
    settings?: ConstructorParameters<typeof YMapDefaultSchemeLayer>[0];
};

export function YandexMapDefaultSchemeLayer({
    onUpdateModelValue,
    settings = {},
}: YandexMapDefaultSchemeLayerPropsReact) {
    const { incHold, decHold } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    const layer = useSetupMapChild<YMapDefaultSchemeLayer, never>({
        createFunction: () => new ymaps3.YMapDefaultSchemeLayer(settings || {}),
        settings,
        isLayer: true,
    });

    React.useEffect(() => {
        if (layer) {
            onUpdateModelValue?.(layer);
            if (!releasedRef.current) {
                releasedRef.current = true;
                decHold();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layer, onUpdateModelValue]);

    return null;
}

