import React from 'react';
import { importYmapsCDNModule } from '../../../functions';
import { useSetupMapChild } from '../../internal/useSetupMapChild';

export type YandexMapHintPropsReact = {
    modelValue?: any;
    onUpdateModelValue?: (value: any) => void;
    hintProperty: string;
    children: (settings: { content: string }) => React.ReactNode;
};

export function YandexMapHint({
    onUpdateModelValue,
    hintProperty,
    children,
}: YandexMapHintPropsReact) {
    const element = React.useRef<HTMLDivElement | null>(null);
    const [hintContent, setHintContent] = React.useState('');

    const hint = useSetupMapChild<any, any>({
        createFunction: ({ YMapHint: MapHint, YMapHintContext }: any) => {
            const mapHint = new MapHint({
                hint: (object: any) => object?.properties?.[hintProperty],
            });

            class HintEntity extends ymaps3.YMapEntity<{}> {
                _onAttach() {
                    const e = this as any;
                    e._element = element.current;
                    e._detachDom = ymaps3.useDomContext(e, e._element, null);
                    e._watchContext(YMapHintContext, () => {
                        setHintContent(e._consumeContext(YMapHintContext)?.[hintProperty] ?? '');
                    }, { immediate: true });
                }

                _onDetach() {
                    (this as any)._detachDom?.();
                }
            }

            mapHint.addChild(new HintEntity());
            return mapHint;
        },
        requiredImport: () => importYmapsCDNModule('@yandex/ymaps3-hint') as any,
    });

    React.useEffect(() => {
        if (hint) onUpdateModelValue?.(hint);
    }, [hint, onUpdateModelValue]);

    return (
        <div ref={element} className="__ymap_hint">
            {children({ content: hintContent })}
        </div>
    );
}

