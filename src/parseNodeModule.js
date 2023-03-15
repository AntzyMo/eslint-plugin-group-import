// 提取模块路径信息
const extractChunkInfo = chunk => {
  const splitChunk = chunk.split('/')

  for (const [idx, value] of Object.entries(splitChunk)) {
    if (isNormalName(value)) {
      // 获取模块名和后缀名
      const [name, ext] = splitChunk.at(-1).split('.')
      // 获取根路径
      const root = splitChunk.slice(0, Number(idx) + 1).join('/')

      return {
        firstRoot: splitChunk[0],
        root,
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

module.exports = {
  extractChunkInfo,
  getImportItems
}
