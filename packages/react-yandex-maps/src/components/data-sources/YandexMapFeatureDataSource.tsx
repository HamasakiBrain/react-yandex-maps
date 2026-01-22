import type { YMapFeatureDataSource } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../../utils/system';
import { useYandexMapContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapFeatureDataSourcePropsReact = {
    modelValue?: YMapFeatureDataSource | null;
    onUpdateModelValue?: (value: YMapFeatureDataSource) => void;
    settings: ConstructorParameters<typeof YMapFeatureDataSource>[0];
};

export function YandexMapFeatureDataSource({
    onUpdateModelValue,
    settings,
}: YandexMapFeatureDataSourcePropsReact) {
    const { incHold, decHold } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    React.useEffect(() => {
        if (!settings?.id) {
            throwException({
                text: 'You must specify id in YandexMapFeatureDataSource settings',
            });
        }
    }, [settings]);

    const ds = useSetupMapChild<YMapFeatureDataSource, never>({
        createFunction: () => new ymaps3.YMapFeatureDataSource(settings),
        settings,
        isLayer: true,
    });

    React.useEffect(() => {
        if (ds) {
            onUpdateModelValue?.(ds);
            if (!releasedRef.current) {
                releasedRef.current = true;
                decHold();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ds, onUpdateModelValue]);

    return null;
}

