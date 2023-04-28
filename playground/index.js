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

