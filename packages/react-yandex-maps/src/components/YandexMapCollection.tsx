import type { YMapCollection } from '@yandex/ymaps3-types';
import React from 'react';
import { YandexMapRootContext } from './internal/contexts';
import { useSetupMapChild } from './internal/useSetupMapChild';

export type YandexMapCollectionPropsReact = {
    modelValue?: YMapCollection | null;
    onUpdateModelValue?: (value: YMapCollection | null) => void;
    children?: React.ReactNode;
};

export function YandexMapCollection({
    onUpdateModelValue,
    children,
}: YandexMapCollectionPropsReact) {
    const initPromises = React.useRef<PromiseLike<any>[]>([]);

    const collection = useSetupMapChild<YMapCollection, never>({
        createFunction: () => new ymaps3.YMapCollection({}),
    });

    React.useEffect(() => {
        onUpdateModelValue?.(collection ?? null);
    }, [collection, onUpdateModelValue]);

    if (!collection) return null;

    return (
        <YandexMapRootContext.Provider value={{ root: collection, initPromises }}>
            {children}
        </YandexMapRootContext.Provider>
    );
}

