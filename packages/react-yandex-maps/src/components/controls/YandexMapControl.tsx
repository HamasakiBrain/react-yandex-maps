import type { YMapControl } from '@yandex/ymaps3-types';
import React from 'react';
import { useSetupMapChild } from '../internal/useSetupMapChild';

export type YandexMapControlPropsReact = {
    modelValue?: YMapControl | null;
    onUpdateModelValue?: (value: YMapControl) => void;
    settings?: ConstructorParameters<typeof YMapControl>[0];
    index?: number;
    children?: React.ReactNode;
};

export function YandexMapControl({
    onUpdateModelValue,
    settings = {},
    index,
    children,
}: YandexMapControlPropsReact) {
    const element = React.useRef<HTMLDivElement | null>(null);

    const control = useSetupMapChild<YMapControl, never>({
        createFunction: () => new ymaps3.YMapControl(settings, element.current!),
        settings,
        strictMapRoot: true,
        index,
    });

    React.useEffect(() => {
        if (control) onUpdateModelValue?.(control);
    }, [control, onUpdateModelValue]);

    return (
        <div ref={element} className="__ymap_control">
            {children}
        </div>
    );
}

