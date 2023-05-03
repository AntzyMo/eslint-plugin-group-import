import { isPackageExists } from 'local-pkg'

// 解析模块重组结构
export function parseNode(node, context) {
  const sourceCode = context.getSourceCode()
  const { validatedNode, sourceNodeStart, sourceNodeEnd, otherNode } = findAllValidatedNode(node, isImport)
  const parsedValidatedNode = validatedNode.map(item => {
    const moduleStr = item.source.value
    const text = removeSemi(sourceCode.getText(item))

    return {
      text,
      group: parseModuleStr(moduleStr, item.importKind)
    }
  })

  const validatedSourceCode = sourceCode
    .getText()
    .slice(sourceNodeStart, sourceNodeEnd)
    .split('\n')
    .map(item => removeSemi(item))
    .join('\n')

  return {
    parsedValidatedNode,
    validatedSourceCode,
    otherNode,
    validatedNode,
    sourceNodeStart,
    sourceNodeEnd
  }
}

function findAllValidatedNode(node, validateNodeTypeFn) {
  const lastNodeIdx = node.findLastIndex(item => validateNodeTypeFn(item.type))
  const validatedNode = []
  const otherNode = []

  node.slice(0, lastNodeIdx + 1).forEach(item => {
    if (validateNodeTypeFn(item.type)) {
      validatedNode.push(item)
    } else {
      otherNode.push(item)
    }
  })

  return {
    validatedNode,
    otherNode,
    sourceNodeStart: node[0].range[0],
    sourceNodeEnd: validatedNode.at(-1).range[1]
  }
}

function parseModuleStr(moduleStr, importKind) {
  try {
    const isPKG = isPackageExists(moduleStr)
    const getFirstNameUri = moduleStr => {
      // 查找 ../ ./ @/ 等特殊字符
      const [group] = moduleStr.match(/^(((\.\.?)|\W+)\/)+([@-\w]+){1}/g)
      return group
    }
    return isPKG ? 'npm' : importKind === 'type' ? 'type' : getFirstNameUri(moduleStr)
  } catch {
    console.log(`没有找到 ${moduleStr} 模块, 请下载依赖`)
  }
}

export function createGroups(parsedValidatedNode, groupsSort) {
  const groupMap = {}

  // 1. 先按照 group 分组
  parsedValidatedNode.forEach(item => {
    const { group } = item
    if (!groupMap[group]) groupMap[group] = []
    groupMap[group].push(item)
  })

  // 2. 根据 groupsSort 找出 group 排序的优先级
  const firstGroups = groupsSort
    .map(item => {
      const arr = groupMap[item]
      delete groupMap[item]
      return arr ? [item, arr] : []
    })
    .filter(item => item.length)

  // 3. 创建一个 otherGroups 分组, 找出 group 长度为 1且不是 npm
  const otherGroups = Object.entries(groupMap).filter(([key, value]) => {
    if (value.length === 1) {
      delete groupMap[key]
      return true
    }
    return false
  })

  // 4. 排序并换行
  const groupsText = handleNewLine(handleGroupsSort([firstGroups, Object.entries(groupMap), otherGroups]))
  return groupsText
}

function handleGroupsSort(resultGroups) {
  const [firstGroups, middleGroups, otherGroups] = resultGroups

  const groupSort = (groupArr, sortGroupLength = true) => {
    if (sortGroupLength) groupArr.sort((a, b) => downSort(a.length, b.length))
    for (const [, arr] of Object.entries(groupArr)) {
      textLengthSort(arr)
    }
    return groupArr
  }

  const textLengthSort = arr => {
    return arr.sort((a, b) => downSort(a.text.length, b.text.length))
  }

  const resultOtherGroups = otherGroups.map(([, arr]) => arr[0])
  textLengthSort(resultOtherGroups)

  return [
    groupSort(Object.values(Object.fromEntries(firstGroups)), false),
    groupSort(Object.values(Object.fromEntries(middleGroups))),
    resultOtherGroups
  ]
}

const handleNewLine = resultGroups => {
  const [firstGroups, middleGroups, otherGroups] = resultGroups
  const [npmGroup, typeGroup] = firstGroups

  const transformToText = arr => {
    return arr.map(item => item.text).join('\n')
  }

  // 如果typeGroup只有一个，那么就把它放到npmGroup里面
  if (typeGroup.length === 1) {
    npmGroup.push(typeGroup[0])
    firstGroups.splice(1, 1)
  }

  const firstText = firstGroups.map(arr => transformToText(arr)).join('\n\n')
  const middleText = middleGroups.map(arr => transformToText(arr)).join('\n\n')
  const otherText = transformToText(otherGroups)

  return `${firstText ? `${firstText}\n\n` : ''}${middleText ? `${middleText}\n\n` : ''}${otherText}`
}

function isImport(type) {
  return type === 'ImportDeclaration'
}

// 删除分号
function removeSemi(item) {
  const semiIdx = item.indexOf(';')
  const text = item.trim()
  return semiIdx !== -1 ? item.slice(0, semiIdx) : text
}

// 处理降序逻辑
const downSort = (a, b) => {
  if (a === b) return 0
  return a > b ? 1 : -1
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
