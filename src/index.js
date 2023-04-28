
import { parseNode } from './shared'

export function createImportGroup(node, context) {
  console.log(123)
  const { groups = [], sort = [] } = context.options[0] || {}
  const defaultGroups = ['npm', 'type', ...sort]
  const res = parseNode(node, context)
  console.log('res', res)

  // console.log(createGroups(parsedValidatedNode))
}
