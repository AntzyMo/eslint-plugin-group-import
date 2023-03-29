const { extractChunkInfo, getImportItems, downSort, removeSemi, removeWithSameVariate } = require('./utils')

const defaultgroups = ['npm', 'type']

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: '对import进行分组排序',
      url: 'https://github.com/AntzyMo/eslint-plugin-import#readme'
    },
    fixable: 'code',
    messages: { sort: 'Sort imports by group' },
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    ]
  },
  create: context => {
    const nodeCache = new Set()

    return {
      ImportDeclaration(node) {
        nodeCache.add(node.parent.body)
      },

      'Program:exit': () => {
        for (const node of nodeCache) {
          importChunk(node, context)
        }
        nodeCache.clear()
      }
    }
  }
}

const importChunk = (node, context) => {
  const { groups = [], sort = [] } = context.options[0] || {}
  const sortGroup = [...defaultgroups, ...sort]

  const sourceCode = context.getSourceCode()

  const { importItems, otherCode, soruceCodeStart, soruceCodeEnd } = getImportItems(node)

  const otherCodeItems = otherCode.map(item => sourceCode.getText(item)).join('\n')

  // 获取import源代码 之后跟text进行比较
  const importSourceCode = sourceCode
    .getText()
    .slice(soruceCodeStart, soruceCodeEnd)
    .split('\n')
    .map(item => removeSemi(item))
    .join('\n')

  const moduleMap = parseNodeModule(importItems, sourceCode, groups)

  const groupModuleMap = createGroup(moduleMap)
  const sortGroupModuleMap = groupSort(groupModuleMap, sortGroup)
  groupModuleSort(sortGroupModuleMap)

  const chunks = Object.values(sortGroupModuleMap).filter(item => item.length).map(arr => arr.map(item => item.text).join('\n'))
  const importText = chunks.join('\n\n')

  if (importSourceCode === importText)
    return

  context.report({
    loc: {
      start: importItems[0].loc.start,
      end: importItems.at(-1).loc.end
    },
    messageId: 'sort',
    fix: fixer => {
      return fixer.replaceTextRange([soruceCodeStart, soruceCodeEnd], `${importText};${otherCodeItems}`)
    }
  })
}

// 解析模块重组结构
const parseNodeModule = (node, sourceCode, groups) => node.map(item => {
  const module = item.source.value
  const text = removeSemi(sourceCode.getText(item))
  removeWithSameVariate(sourceCode, item, text)

  return {
    text,
    importKind: item.importKind,
    ...extractChunkInfo(module, groups)
  }
})

// 创建分组
const createGroup = module => {
  const moduleMap = {}

  module.forEach(item => {
    const { root, group, importKind } = item
    let key = group === 'npm' ? 'npm' : root
    if (importKind === 'type') key = 'type'

    if (!moduleMap[key]) moduleMap[key] = []
    moduleMap[key].push(item)
  })

  // 创建 other 分组
  const other = Object.entries(moduleMap).reduce((cur, next) => {
    const [key, arr] = next

    if (key === 'npm') return cur
    if (arr.length === 1) {
      delete moduleMap[key]
      return [...cur, ...arr]
    }

    return cur
  }, [])

  return {
    ...moduleMap,
    other
  }
}

// 排序分组
const groupSort = (groupModuleMap, group) => {
  const groupArr = []

  // 1.筛选优先级
  group.forEach(item => {
    if (Object.prototype.hasOwnProperty.call(groupModuleMap, item)) {
      groupArr.push([item, groupModuleMap[item]])
    }
  })
  // 去除优先级的属性重组数组
  const groupModuleArr = Object.entries(groupModuleMap).reduce((cur, next) => {
    const [key] = next
    if (group.includes(key))
      return cur
    return [...cur, next]
  }, [])

  // 2. 筛选出优先级后 看谁的分组数量多谁就放到最后面
  const other = groupModuleArr.at(-1)
  const rest = groupModuleArr.slice(0, -1)
  rest.sort(([, aArr], [, bArr]) => downSort(aArr.length, bArr.length))

  return Object.fromEntries([...groupArr, ...rest, other])
}

/**
 * 每个分组根据里面的长度去排序
 * @param {*} groupModuleMap
 *
 * import { storeToRefs } from 'pinia'
 * import { onMounted, ref } from 'vue'
 */
const groupModuleSort = groupModuleMap => {
  for (const [, arr] of Object.entries(groupModuleMap)) {
    arr.sort((a, b) => downSort(a.text.length, b.text.length))
  }
}

