import type { YMapLayer } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../../utils/system';
import { useYandexMapContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapLayerPropsReact = {
    modelValue?: YMapLayer | null;
    onUpdateModelValue?: (value: YMapLayer) => void;
    settings: ConstructorParameters<typeof YMapLayer>[0];
};

export function YandexMapLayer({
    onUpdateModelValue,
    settings,
}: YandexMapLayerPropsReact) {
    const { incHold, decHold } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    React.useEffect(() => {
        if (!settings?.type) {
            throwException({
                text: 'You must specify type in YandexMapLayer settings',
            });
        }
    }, [settings]);

    const layer = useSetupMapChild<YMapLayer, never>({
        createFunction: () => new ymaps3.YMapLayer(settings || {}),
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

