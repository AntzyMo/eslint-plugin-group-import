# eslint-plugin-group-import

<p align="center">
    <br> <a href="README.md">English</a> | 中文
</p>

自动根据分组对import进行排序，默认`npm`,`type`在最上面，`other`在最下面，`other`的形成发的键：没有重复导入的目录

- ✅️ import的导入排序
- ✅️ 支持 TypeScript
- ❌ export的导入排序（进行中...）



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

在你的`.eslintrc.cjs`中添加`group-import`到`plugins`: 

```js
module.exports = {
  plugins: ['group-import'],
}
```

然后添加`import`导入到`rules`

```js
module.exports = {
  rules:{
  'group-import/imports': 2
  }
}
```
也可以搭配`sort-imports`对声明的变量进行排序
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

自定义排序的优先级，默认`npm`,`type`在最上面，`other`在最下面，可以通过`groups`配置去改变中间位置
```js
module.exports = {
  rules:{
  'group-import/imports': [2,{groups:['./components']}]
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
## 最后

有什么问题欢迎来提`issues`


