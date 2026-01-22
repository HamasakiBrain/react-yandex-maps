import type { YMapControlButton } from '@yandex/ymaps3-types';
import React from 'react';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapControlButtonSettings = Omit<ConstructorParameters<typeof YMapControlButton>[0], 'element' | 'text'>;

export type YandexMapControlButtonPropsReact = {
    modelValue?: YMapControlButton | null;
    onUpdateModelValue?: (value: YMapControlButton) => void;
    settings?: YandexMapControlButtonSettings;
    index?: number;
    children?: React.ReactNode;
};

export function YandexMapControlButton({
    onUpdateModelValue,
    settings = {},
    index,
    children,
}: YandexMapControlButtonPropsReact) {
    const element = React.useRef<HTMLDivElement | null>(null);

    const btn = useSetupMapChild<YMapControlButton, never>({
        createFunction: () => new ymaps3.YMapControlButton({
            ...settings,
            element: element.current!,
        }),
        settings: {
            ...settings,
            // keep parity with Vue impl; element will be defined by the time effects run
            element: element.current as any,
        } as any,
        strictMapRoot: true,
        index,
    });

    React.useEffect(() => {
        if (btn) onUpdateModelValue?.(btn);
    }, [btn, onUpdateModelValue]);

    return (
        <div ref={element} className="__ymap_control-button">
            {children}
        </div>
    );
}

