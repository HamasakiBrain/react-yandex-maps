import type { YMapScaleControl } from '@yandex/ymaps3-types';
import React from 'react';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapScaleControlPropsReact = {
    modelValue?: YMapScaleControl | null;
    onUpdateModelValue?: (value: YMapScaleControl) => void;
    settings?: ConstructorParameters<typeof YMapScaleControl>[0];
    index?: number;
};

export function YandexMapScaleControl({
    onUpdateModelValue,
    settings = {},
    index,
}: YandexMapScaleControlPropsReact) {
    const ctrl = useSetupMapChild<YMapScaleControl, never>({
        createFunction: () => new ymaps3.YMapScaleControl(settings),
        settings,
        strictMapRoot: true,
        index,
    });

    React.useEffect(() => {
        if (ctrl) onUpdateModelValue?.(ctrl);
    }, [ctrl, onUpdateModelValue]);

    return null;
}

