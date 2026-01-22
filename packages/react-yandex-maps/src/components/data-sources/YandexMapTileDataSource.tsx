import type { YMapTileDataSource } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../../utils/system';
import { useYandexMapContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapTileDataSourcePropsReact = {
    modelValue?: YMapTileDataSource | null;
    onUpdateModelValue?: (value: YMapTileDataSource) => void;
    settings: ConstructorParameters<typeof YMapTileDataSource>[0];
};

export function YandexMapTileDataSource({
    onUpdateModelValue,
    settings,
}: YandexMapTileDataSourcePropsReact) {
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
                text: 'You must specify id in YandexMapTileDataSource settings',
            });
        }
    }, [settings]);

    const ds = useSetupMapChild<YMapTileDataSource, never>({
        createFunction: () => new ymaps3.YMapTileDataSource(settings),
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

