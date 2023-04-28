const { createImportGroup } = require('../dist')

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: '对import进行分组排序',
      url: 'https://github.com/AntzyMo/eslint-plugin-import#readme'
    },
    fixable: 'code',
    messages: { sort: 'Sort imports by group' },
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    ]
  },
  create: context => {
    const nodeCache = new Set()

    return {
      ImportDeclaration(node) {
        nodeCache.add(node.parent.body)
      },

      'Program:exit': () => {
        for (const node of nodeCache) {
          createImportGroup(node, context)
        }
        nodeCache.clear()
      }
    }
  }
}
