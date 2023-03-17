<div style="display:flex;justify-content: center;"><img src="./assets/logo.svg"/></div>

<p align="center">
    <br> English | <a href="README-CN.md">中文</a>
</p>

Automatically sorts imports based on groups. By default, `npm` and `type` are at the top and `other` is at the bottom. The `other` group is formed because there are no repeated imported directories.

- ✅️ Import sorting
- ✅️ TypeScript support
- ❌ Export sorting (in progress...)

## Example
```js
  console.log(1)
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'

  import { useRightMemuStore, useTabStore } from '@/stores'

  import { useBgIamgeStore } from '../stores/index'
  import { pageVisibilitychange } from '../utils/index'
  import IconDialog from './components/IconDialog/index.vue'
  console.log(2)
  import RightMemu from './components/RightMemu/index.vue'
  import SearchInput from './components/SearchInput/index.vue'
  import Tab from './components/Tab/index.vue'
  import WallpaperDialog from './components/wallpaperDialog/index.vue'
  import type { iconDialogRefType, wallpaperDialogRefType } from './type'
  console.log(3)
  import useRightMemu from './hooks/useRightMemu'
  import useRightMemu1 from './hooks/useRightMemu1'
  console.log(4)

```

⬇️

```js
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'

  import type { iconDialogRefType, wallpaperDialogRefType } from './type'

  import useRightMemu from './hooks/useRightMemu'
  import useRightMemu1 from './hooks/useRightMemu1'

  import Tab from './components/Tab/index.vue'
  import RightMemu from './components/RightMemu/index.vue'
  import IconDialog from './components/IconDialog/index.vue'
  import SearchInput from './components/SearchInput/index.vue'
  import WallpaperDialog from './components/wallpaperDialog/index.vue'

  import { useBgIamgeStore } from '../stores/index'
  import { pageVisibilitychange } from '../utils/index'
  import { useRightMemuStore, useTabStore } from '@/stores'
  console.log(1)
  console.log(2)
  console.log(3)
  console.log(4)
```

## Installation

```
pnpm add eslint-plugin-group-import -D
```

## Usage

Add `group-import` to `plugins` in your `.eslintrc.cjs` file: 

```js
module.exports = {
  plugins: ['group-import'],
}
```

Then add `import` to `rules`:

```js
module.exports = {
  rules:{
  'group-import/imports': 2
  }
}
```
You can also use `sort-imports` to sort the variables that are declared:
```js
module.exports = {
  "rules":{
    'sort-imports': [
        2,
        {
          ignoreDeclarationSort: true
        }
      ],
  }
}
```
⬇️

```js
import {b,a} from './test'
         ↓
import { a, b } from './test'
```


## configuration
### sort
Customize the sort order by configuring the groups. By default, `npm` and `type` are at the top, and `other` is at the bottom. You can modify the middle positions by changing the groups.

```js
module.exports = {
  rules:{
  'group-import/imports': [2,{
    sort:['./components']
  }]
  }
}
```
⬇️

```js
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'

  import type { iconDialogRefType, wallpaperDialogRefType } from './type'

  import Tab from './components/Tab/index.vue'
  import RightMemu from './components/RightMemu/index.vue'
  import IconDialog from './components/IconDialog/index.vue'
  import SearchInput from './components/SearchInput/index.vue'
  import WallpaperDialog from './components/wallpaperDialog/index.vue'

  import useRightMemu from './hooks/useRightMemu'
  import useRightMemu1 from './hooks/useRightMemu1'

  import { useBgIamgeStore } from '../stores/index'
  import { pageVisibilitychange } from '../utils/index'
  import { useRightMemuStore, useTabStore } from '@/stores'
  console.log(1)
  console.log(2)
  console.log(3)
  console.log(4)
```

### groups
Custom grouping.

```js
module.exports = {
  rules:{
  'group-import/imports': [2,{
    groups:['../stores/index']
  }]
  }
}
```
⬇️

```js
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'

  import type { iconDialogRefType, wallpaperDialogRefType } from './type'

  import { useBgIamgeStore } from '../stores/index'

  import Tab from './components/Tab/index.vue'
  import RightMemu from './components/RightMemu/index.vue'
  import IconDialog from './components/IconDialog/index.vue'
  import SearchInput from './components/SearchInput/index.vue'
  import WallpaperDialog from './components/wallpaperDialog/index.vue'

  import useRightMemu from './hooks/useRightMemu'
  import useRightMemu1 from './hooks/useRightMemu1'

  import { pageVisibilitychange } from '../utils/index'
  import { useRightMemuStore, useTabStore } from '@/stores'
  console.log(1)
  console.log(2)
  console.log(3)
  console.log(4)
```

## Finally

If you have any questions, please feel free to open an `issue`.


