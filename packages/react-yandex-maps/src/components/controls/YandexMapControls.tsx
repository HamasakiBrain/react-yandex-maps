import type { YMapControls } from '@yandex/ymaps3-types';
import React from 'react';
import { throwException } from '../../utils/system';
import { YandexMapRootContext } from '../internal/contexts';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapControlsPropsReact = {
    modelValue?: YMapControls | null;
    onUpdateModelValue?: (value: YMapControls) => void;
    settings: ConstructorParameters<typeof YMapControls>[0];
    children?: React.ReactNode;
};

export function YandexMapControls({
    onUpdateModelValue,
    settings,
    children,
}: YandexMapControlsPropsReact) {
    const initPromises = React.useRef<PromiseLike<any>[]>([]);

    const controls = useSetupMapChild<YMapControls, never>({
        createFunction: () => new ymaps3.YMapControls(settings),
        settings,
    });

    React.useEffect(() => {
        if (!settings?.position) {
            throwException({
                text: 'You must specify position in YandexMapControls settings',
            });
        }
    }, [settings]);

    React.useEffect(() => {
        if (controls) onUpdateModelValue?.(controls);
    }, [controls, onUpdateModelValue]);

    if (!controls) return null;

    return (
        <YandexMapRootContext.Provider value={{ root: controls, initPromises }}>
            {children}
        </YandexMapRootContext.Provider>
    );
}

