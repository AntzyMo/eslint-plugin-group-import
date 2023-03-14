const { extractChunkInfo } = require('./utils')

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: '对import进行分组排序',
      url: 'https://github.com/AntzyMo/eslint-plugin-import#readme'
    },
    fixable: 'code',
    messages: { sort: 'Sort imports by group' },
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

const importChunk = (node, context) => {
  const sourceCode = context.getSourceCode()
  // 获取所有虚拟dom的import节点
  const importNodeList = getImportNodesList(node)

  // 获取源代码中所有import的代码
  const importSourceCode = getImportSource(node, sourceCode)

  const moduleMap = parseNodeModule(importNodeList, sourceCode)
  const groupModuleMap = createGroup(moduleMap)
  const sortGroupModuleMap = groupSort(groupModuleMap, context)
  groupModuleSort(sortGroupModuleMap)

  const chunks = Object.values(sortGroupModuleMap).map(arr => arr.map(item => item.text).join('\n'))
  const text = chunks.join('\n\n')

  if (importSourceCode === text) return

  context.report({
    loc: {
      start: importNodeList[0].loc.start,
      end: importNodeList.at(-1).loc.end
    },
    messageId: 'sort',
    fix: fixer => {
      const start = importNodeList[0].start
      const end = importNodeList.at(-1).end
      return fixer.replaceTextRange([start, end], text)
    }
  })
}

// 获取所有虚拟dom的import节点
const getImportNodesList = node => {
  const findLastimportIdx = node.findLastIndex(item => item.type === 'ImportDeclaration')
  return node.slice(0, findLastimportIdx + 1)
}

// 获取源代码的import代码
const getImportSource = (node, sourceCode) => {
  // 获取源代码中最后一个import的行数
  const findLastimport = node.findLast(item => item.type === 'ImportDeclaration')
  const lastImportIdx = findLastimport.loc.end.line

  return sourceCode.lines
    .slice(0, lastImportIdx)
    .reduce((cur, next) => {
      const text = next.trim()
      return [...cur, text]
    }, [])
    .join('\n')
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
const groupSort = (groupModuleMap, context) => {
  const { groups = [] } = context.options
  const group = ['npm', ...groups]
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
  const other = groupModuleArr.at(-1)
  const rest = groupModuleArr.slice(0, -1)
  rest.sort(([, aArr], [, bArr]) => (aArr.length > bArr.length ? 1 : -1))

  return Object.fromEntries([...groupArr, ...groupModuleArr, ...rest, other])
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
