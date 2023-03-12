const { extractChunkInfo } = require('./utils')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '识别到Ref函数,变量声明自动加上Ref后缀',
      url: 'https://github.com/AntzyMo/eslint-config/tree/main/packages/eslint-plugin-antzy#readme'
    },
    fixable: 'code',
    messages: { suffixRef: '建议加上Ref后缀' },
    schema: []
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

let sourceCache = ''

const importChunk = (node, context) => {
  const sourceCode = context.getSourceCode()
  const importIdx = node.findLastIndex(item => item.type === 'ImportDeclaration')
  const importList = node.slice(0, importIdx + 1)

  const start = 0
  const end = node.at(-1).end

  const moduleMap = parseNodeModule(importList, sourceCode)
  const groupModuleMap = createGroup(moduleMap)
  const sortGroupModuleMap = groupSort(groupModuleMap)
  groupModuleSort(sortGroupModuleMap)

  const chunks = Object.values(sortGroupModuleMap).map(arr => arr.map(item => item.text).join('\n'))
  const text = chunks.join('\n\n')

  if (sourceCache === text) return
  sourceCache = text
  context.report({
    loc: {
      start,
      end
    },
    message: 'test',
    fix: fixer => {
      return fixer.replaceTextRange([start, end], text)
    }
  })
}

// 解析模块重组结构
const parseNodeModule = (node, sourceCode) =>
  node.map(item => {
    const module = item.source.value
    const text = sourceCode.getText(item)
    return {
      text,
      ...extractChunkInfo(module)
    }
  })

// 创建分组
const createGroup = module => {
  const moduleMap = {}
  const other = []

  module.forEach(item => {
    const { root, group } = item
    const key = group === 'npm' ? 'npm' : root

    if (!moduleMap[key]) moduleMap[key] = []
    moduleMap[key].push(item)
  })

  for (const [key, arr] of Object.entries(moduleMap)) {
    if (arr.length === 1) {
      other.push(...arr)
      delete moduleMap[key]
    }
  }

  return {
    ...moduleMap,
    other
  }
}

// 排序分组
const groupSort = groupModuleMap => {
  const group = ['npm']
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
    if (group.includes(key)) return cur
    return [...cur, next]
  }, [])

  // 2. 筛选出优先级后 看谁的分组数量多谁就放到最后面
  groupModuleArr.sort(([, aArr], [, bArr]) => (aArr.length > bArr.length ? 1 : -1))
  return Object.fromEntries([...groupArr, ...groupModuleArr])
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
    arr.sort((a, b) => (a.text.length > b.text.length ? 1 : -1))
  }
}
