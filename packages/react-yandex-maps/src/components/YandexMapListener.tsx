import type { BehaviorEvents, DomEvents, MapEvents, YMapListener } from '@yandex/ymaps3-types';
import React from 'react';
import { useSetupMapChild } from './internal/useSetupMapChild';

export type YandexMapListenerSettings = Partial<DomEvents & MapEvents & BehaviorEvents>;

export type YandexMapListenerPropsReact = {
    modelValue?: YMapListener | null;
    onUpdateModelValue?: (value: YMapListener) => void;
    settings?: ConstructorParameters<typeof YMapListener>[0];
};

export function YandexMapListener({
    onUpdateModelValue,
    settings = {},
}: YandexMapListenerPropsReact) {
    const child = useSetupMapChild<YMapListener, never>({
        createFunction: () => new ymaps3.YMapListener(settings || {}),
        settings,
    });

    React.useEffect(() => {
        if (child) onUpdateModelValue?.(child);
    }, [child, onUpdateModelValue]);

    return null;
}

