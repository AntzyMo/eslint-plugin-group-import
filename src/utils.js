// 提取模块路径信息
const extractChunkInfo = (chunk, groups) => {
  const splitChunk = chunk.split('/')

  for (const [idx, value] of Object.entries(splitChunk)) {
    if (isNormalName(value)) {
      // 获取模块名和后缀名
      const [name, ext] = splitChunk.at(-1).split('.')

      // 获取根路径
      const customGroupRoot = () => {
        const root = splitChunk.slice(0, Number(idx) + 1).join('/')
        if (!groups.length) return root
        for (const groupUrl of groups) {
          if (chunk.includes(groupUrl)) return groupUrl
        }
        return root
      }

      return {
        firstRoot: splitChunk[0],
        root: customGroupRoot(),
        url: chunk,
        group: splitChunk.length === 1 ? 'npm' : splitChunk[idx],
        split: splitChunk,
        name,
        ext
      }
    }
  }
}

/**
 * 找到最后一个import，然后重组结构
 * import 在最上面，其他都移到下面
 * @param {*} node
 * @returns
 */
const getImportItems = node => {
  const lastImportIdx = node.findLastIndex(item => isImport(item.type))
  const otherCode = []
  const importItems = node.slice(0, lastImportIdx + 1).reduce((cur, next) => {
    if (isImport(next.type)) {
      return [...cur, next]
    } else {
      otherCode.push(next)
      return cur
    }
  }, [])

  return {
    importItems,
    otherCode,
    soruceCodeStart: node[0].range[0],
    soruceCodeEnd: importItems.at(-1).range[1]
  }
}

// 判断是否是正常的模块名
const isNormalName = string => {
  return !/^([.]|[.]{2}|[@]){1}$/g.test(string)
}

const isImport = type => {
  return type === 'ImportDeclaration'
}

// 去除重复的变量
const removeWithSameVariate = (sourceCode, item, text) => {
  const itemTokens = sourceCode.getFirstTokens(item)
  const identifyMap = itemTokens.reduce((cur, next) => {
    if (next.type === 'Identifier') {
      if (!cur[next.value]) cur[next.value] = 0
      cur[next.value]++
    }
    return cur
  }, {})

  for (const [key, value] of Object.entries(identifyMap)) {
    if (value > 1) {
      text = text.replace(`${key},`, '')
    }
  }
}

// 删除分号
const removeSemi = item => {
  const semiIdx = item.indexOf(';')
  const text = item.trim()
  return semiIdx !== -1 ? item.slice(0, semiIdx) : text
}

module.exports = {
  extractChunkInfo,
  getImportItems,
  removeWithSameVariate,
  removeSemi
}
