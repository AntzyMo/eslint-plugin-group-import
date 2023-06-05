import { reactive, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Ref } from 'vue'

const a: Ref<string> = ref('1')
console.log('a', a)
console.log(reactive, ref, useDebounceFn)
