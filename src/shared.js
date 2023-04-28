
import { isPackageExists } from 'local-pkg'

// const { isPackageExists } = require('local-pkg')

export function findAllValidatedNode(node, validateNodeTypeFn) {
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

// 解析模块重组结构
export function parseNode(node, context) {
  const sourceCode = context.getSourceCode()
  const {
    validatedNode,
    ...rest
  } = findAllValidatedNode(node, isImport)

  const parsedValidatedNode = validatedNode.map(item => {
    const moduleStr = item.source.value
    console.log(isPackageExists(moduleStr), '11')
    const text = removeSemi(sourceCode.getText(item))
    return {
      text
      // group: parseModuleStr(moduleStr, item.importKind)
    }
  })

  return {
    parsedValidatedNode,
    ...rest
  }
}

export function createGroups(parsedValidatedNode) {
  const groupMap = {}

  // 1. 先按照 group 分组
  parsedValidatedNode.forEach(item => {
    const { group } = item
    if (!groupMap[group]) groupMap[group] = []
    groupMap[group].push(item)
  })

  // 2. 创建一个 orderGroups 分组, 找出 group 长度为 1且不是 npm
  const orderGroups = Object.entries(groupMap).filter(([key, value]) => {
    delete groupMap[key]
    return key !== 'npm' && value.length === 1
  })

  // 3. 排序
  const resultGroups = {
    ...groupMap,
    orderGroups
  }
  groupsSort(resultGroups)
  return resultGroups
}

function parseModuleStr(moduleStr, importKind) {
  console.log(555)
  const isPKG = isPackageExists(moduleStr)
  const getFirstNameUri = moduleStr => {
    // 查找 ../ ./ @/ 等特殊字符
    const [group] = moduleStr.match(/^(((\.\.?)|\W+)\/)+([@-\w]+){1}/g)
    return group
  }
  return isPKG ? 'npm' : importKind === 'type' ? 'type' : getFirstNameUri(moduleStr)
}

function groupsSort(resultGroups) {

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

