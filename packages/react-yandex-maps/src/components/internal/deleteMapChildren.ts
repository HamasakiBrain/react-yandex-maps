import type { Projection } from '@yandex/ymaps3-types/common/types';
import type { YMap, YMapEntity, YMapGroupEntity } from '@yandex/ymaps3-types';
import { throwException } from '../../utils/system';

export function deleteMapChildren({
    children,
    isMercator,
    root,
}: {
    children: YMapEntity<unknown> | Projection;
    isMercator?: boolean;
    root: YMap | YMapGroupEntity<any> | YMapEntity<unknown>[] | null;
}) {
    if (!root) {
        throwException({
            text: 'Failed to execute deleteMapChild due to destroyed root',
            isInternal: true,
        });
    }

    if (children && !isMercator) {
        if (Array.isArray(root)) {
            const idx = root.indexOf(children as any);
            if (idx >= 0) root.splice(idx, 1);
        }
        else {
            root.removeChild(children as YMapEntity<unknown>);
        }
    }
    else if (root && children && isMercator && 'update' in root) {
        (root as YMap).update({
            projection: undefined,
        });
    }
}

