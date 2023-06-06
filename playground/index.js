import os from 'node:os'
import { reactive, ref } from 'vue'
import { isPackageExists } from 'local-pkg'
import { useDebounceFn } from '@vueuse/core'

import {
  fun,
  fun1
} from './test'
import {
  fun2,
  fun3
} from './test1'

console.log(os, isPackageExists)

console.log(fun, fun1)
console.log(fun2, fun3)
console.log(23)
console.log(1)
console.log('a')
console.log(reactive, ref, useDebounceFn)
