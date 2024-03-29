
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default)
      }
    })
  ],
  shortcuts: {
    'n-text-base': 'c-red dark:c-green'
  }
})
