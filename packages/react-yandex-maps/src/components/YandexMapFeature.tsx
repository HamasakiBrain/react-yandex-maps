import type { YMapFeature } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../utils/system';
import { useSetupMapChild } from './internal/useSetupMapChild';

export type YandexMapFeaturePropsReact = {
    modelValue?: YMapFeature | null;
    onUpdateModelValue?: (value: YMapFeature | null) => void;
    settings: ConstructorParameters<typeof YMapFeature>[0];
};

export function YandexMapFeature({
    onUpdateModelValue,
    settings,
}: YandexMapFeaturePropsReact) {
    React.useEffect(() => {
        if (!settings?.geometry) {
            throwException({
                text: 'You must specify geometry in YandexMapFeature settings',
            });
        }
    }, [settings]);

    const feature = useSetupMapChild<YMapFeature, never>({
        createFunction: () => new ymaps3.YMapFeature(settings),
        settings,
    });

    React.useEffect(() => {
        onUpdateModelValue?.(feature ?? null);
    }, [feature, onUpdateModelValue]);

    return null;
}

