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

// 判断是否是正常的模块名
const isNormalName = string => {
  return !/^([.]|[.]{2}|[@]){1}$/g.test(string)
}

module.exports = {
  extractChunkInfo
}
