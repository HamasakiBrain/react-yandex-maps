import React from 'react';
import { importYmapsCDNModule } from '../../../functions';
import { useSetupMapChild } from '../../internal/useSetupMapChild';

export type YandexMapImageOverlayPropsReact = {
    modelValue?: any;
    onUpdateModelValue?: (value: any) => void;
    settings: any;
};

export function YandexMapImageOverlay({
    onUpdateModelValue,
    settings,
}: YandexMapImageOverlayPropsReact) {
    const overlay = useSetupMapChild<any, any>({
        createFunction: theme => new theme.YMapImageOverlay(settings),
        requiredImport: () => importYmapsCDNModule('@yandex/ymaps3-default-ui-theme') as any,
        settings,
    });

    React.useEffect(() => {
        if (overlay) onUpdateModelValue?.(overlay);
    }, [overlay, onUpdateModelValue]);

    return null;
}

