# @jetbrain/react-yandex-maps

React-компоненты для **Yandex Maps JS API 3.0** (ymaps3).

## Установка

```bash
npm i @jetbrain/react-yandex-maps
```

Также установите peer-зависимости:

```bash
npm i @yandex/ymaps3-types
```

## Next.js (App Router) пример

1) Добавьте CSS один раз (например, в `app/layout.tsx`):

```tsx
import "@yandex-maps-unofficial/react-yandex-maps/css";
```

2) Рендерите карту в client component:

```tsx
"use client";

import {
  createYmapsOptions,
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
} from "@jetbrain/react-yandex-maps";

createYmapsOptions({
  apikey: process.env.NEXT_PUBLIC_YMAPS_API_KEY!,
});

export function Map() {
  return (
    <div style={{ height: 500 }}>
      <YandexMap settings={{ location: { center: [37.6176, 55.7558], zoom: 10 } }}>
        <YandexMapDefaultSchemeLayer />
        <YandexMapDefaultFeaturesLayer />
      </YandexMap>
    </div>
  );
}
```

## Сборка

```bash
yarn workspace @yandex-maps-unofficial/react-yandex-maps build
```

