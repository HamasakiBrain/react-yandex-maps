import type { YMapEntity } from '@yandex/ymaps3-types';
import React from 'react';
import { useSetupMapChild } from './internal/useSetupMapChild';

export type YandexMapEntityPropsReact = {
    modelValue?: YMapEntity<any> | null;
    onUpdateModelValue?: (value: YMapEntity<any> | null) => void;
    index?: number;
    children?: React.ReactNode;
};

export function YandexMapEntity({
    onUpdateModelValue,
    index,
    children,
}: YandexMapEntityPropsReact) {
    const element = React.useRef<HTMLDivElement | null>(null);

    const child = useSetupMapChild<YMapEntity<any>, never>({
        createFunction: () => {
            class Entity extends ymaps3.YMapEntity<any> {
                _onAttach() {
                    (this as any)._element = element.current;
                    (this as any)._detachDom = ymaps3.useDomContext(this, (this as any)._element);
                }

                _onDetach() {
                    (this as any)._detachDom?.();
                    (this as any)._detachDom = null;
                    (this as any)._element = null;
                }
            }

            return new Entity() as unknown as YMapEntity<any>;
        },
        index,
    });

    React.useEffect(() => {
        onUpdateModelValue?.(child ?? null);
    }, [child, onUpdateModelValue]);

    return (
        <div ref={element} className="__ymap_entity">
            {children}
        </div>
    );
}

