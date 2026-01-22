import type { YMapDefaultFeaturesLayer } from '@yandex/ymaps3-types';
import React from 'react';
import { useYandexMapContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapDefaultFeaturesLayerPropsReact = {
    modelValue?: YMapDefaultFeaturesLayer | null;
    onUpdateModelValue?: (value: YMapDefaultFeaturesLayer) => void;
    settings?: ConstructorParameters<typeof YMapDefaultFeaturesLayer>[0];
};

export function YandexMapDefaultFeaturesLayer({
    onUpdateModelValue,
    settings = {},
}: YandexMapDefaultFeaturesLayerPropsReact) {
    const { incHold, decHold } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    const layer = useSetupMapChild<YMapDefaultFeaturesLayer, never>({
        createFunction: () => new ymaps3.YMapDefaultFeaturesLayer(settings || {}),
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

