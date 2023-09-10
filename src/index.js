import { resolveEndOfLine } from './helper'
import { createGroups, parseNode } from './shared'

export function createImportGroup(node, context) {
  const { sort = [] } = context.options[0] || {}
  const sourceCode = context.getSourceCode()
  const defaultGroupsSort = ['npm', 'type', ...sort]

  const {
    validatedNode, parsedValidatedNode,
    validatedSourceCode, otherNode,
    sourceNodeStart, sourceNodeEnd,
    useNode

  } = parseNode(node, context)

  const EOL = resolveEndOfLine(sourceCode.getText().slice(sourceNodeStart, sourceNodeEnd))
  const nodeToText= (node) => [...node].map(item => sourceCode.getText(item)).join(EOL)

  const groupsText = createGroups(parsedValidatedNode, defaultGroupsSort)
  const otherText = nodeToText(otherNode)
  const useText = nodeToText(useNode)

  const changedText = useText ? `${useText}${EOL}${groupsText}` : groupsText

  if (validatedSourceCode === changedText) return

  context.report({
    loc: {
      start: validatedNode[0].loc.start,
      end: validatedNode.at(-1).loc.end
    },
    messageId: 'sort',
    fix: fixer => {
      return fixer.replaceTextRange([sourceNodeStart, sourceNodeEnd], `${changedText};${otherText}`)
    }
  })
}
