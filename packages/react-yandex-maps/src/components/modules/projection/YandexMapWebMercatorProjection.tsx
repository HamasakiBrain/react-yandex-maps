import type { Projection } from '@yandex/ymaps3-types/common/types';
import React from 'react';
import { importYmapsCDNModule } from '../../../functions';
import { useYandexMapContext } from '../../internal/contexts';
import { useSetupMapChild } from '../../internal/useSetupMapChild';

export type YandexMapWebMercatorProjectionPropsReact = {
    modelValue?: any;
    onUpdateModelValue?: (value: any) => void;
};

export function YandexMapWebMercatorProjection({
    onUpdateModelValue,
}: YandexMapWebMercatorProjectionPropsReact) {
    const { incHold, decHold, setProjection } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    const proj = useSetupMapChild<Projection, { WebMercator: new () => any }>({
        isProjection: true,
        createFunction: ({ WebMercator: WebMercatorClass }) => new WebMercatorClass(),
        requiredImport: () => importYmapsCDNModule('@yandex/ymaps3-web-mercator-projection') as any,
    });

    React.useEffect(() => {
        if (proj) {
            setProjection(proj);
            onUpdateModelValue?.(proj as any);
            if (!releasedRef.current) {
                releasedRef.current = true;
                decHold();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proj, onUpdateModelValue]);

    return null;
}

