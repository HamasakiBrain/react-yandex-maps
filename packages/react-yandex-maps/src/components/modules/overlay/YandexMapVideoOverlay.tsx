import React from 'react';
import { importYmapsCDNModule } from '../../../functions';
import { useSetupMapChild } from '../../internal/useSetupMapChild';

export type YandexMapVideoOverlayPropsReact = {
    modelValue?: any;
    onUpdateModelValue?: (value: any) => void;
    settings: any;
};

export function YandexMapVideoOverlay({
    onUpdateModelValue,
    settings,
}: YandexMapVideoOverlayPropsReact) {
    const overlay = useSetupMapChild<any, any>({
        createFunction: theme => new theme.YMapVideoOverlay(settings),
        requiredImport: () => importYmapsCDNModule('@yandex/ymaps3-default-ui-theme') as any,
        settings,
    });

    React.useEffect(() => {
        if (overlay) onUpdateModelValue?.(overlay);
    }, [overlay, onUpdateModelValue]);

    return null;
}

