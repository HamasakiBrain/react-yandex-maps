import type { Projection } from '@yandex/ymaps3-types/common/types';
import React from 'react';
import { importYmapsCDNModule } from '../../../functions';
import { useYandexMapContext } from '../../internal/contexts';
import { useSetupMapChild } from '../../internal/useSetupMapChild';

export type YandexMapCartesianProjectionPropsReact = {
    modelValue?: any;
    onUpdateModelValue?: (value: any) => void;
    bounds: any;
    cycled?: any;
};

export function YandexMapCartesianProjection({
    onUpdateModelValue,
    bounds,
    cycled,
}: YandexMapCartesianProjectionPropsReact) {
    const { incHold, decHold, setProjection } = useYandexMapContext();
    const releasedRef = React.useRef(false);

    React.useEffect(() => {
        incHold();
        return () => {
            if (!releasedRef.current) decHold();
        };
    }, [incHold, decHold]);

    const proj = useSetupMapChild<Projection, { Cartesian: new (bounds: any, cycled?: any) => any }>({
        isProjection: true,
        createFunction: ({ Cartesian: CartesianClass }) => new CartesianClass(bounds, cycled),
        requiredImport: () => importYmapsCDNModule('@yandex/ymaps3-cartesian-projection') as any,
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

