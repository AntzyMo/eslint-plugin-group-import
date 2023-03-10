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

const importChunk = (node, context) => {
  const sourceCode = context.getSourceCode()
  const sourceText = sourceCode.getText()
  const start = 0
  const end = node.at(-1).end

  const moduleMap = parseNodeModule(node, sourceCode)
  const groupModuleMap = createGroup(moduleMap)
  const chunks = moduleSort(groupModuleMap)
  console.log('chunks', chunks)
  const text = chunks.join('\n\n')

  if (sourceText === text) return
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

// 排序
const moduleSort = groupModuleMap => {
  for (const [key, arr] of Object.entries(groupModuleMap)) {
    arr.sort((a, b) => (a.text.length > b.text.length ? 1 : -1))
  }

  const textGroup = Object.values(groupModuleMap).map(arr => arr.map(item => item.text).join('\n'))

  return textGroup
}
