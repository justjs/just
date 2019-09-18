module.exports = {
	'env': {
		'browser': true,
		'node': true
	},
    'plugins': [
        'es5'
    ],
    'globals': {
        'define': 'readonly'
    },
	'extends': [
        'plugin:es5/no-es2016',
        'eslint:recommended'
    ],
	'rules': {
        'camelcase': 'error',
        'no-bitwise': 'error',
        'no-new-object': 'error',
        'no-trailing-spaces': 'error',
        'no-underscore-dangle': 'error',
        'no-array-constructor': 'error',
        'no-whitespace-before-property': 'error',
        'multiline-comment-style': ['error', 'starred-block'],
		'indent': ['error', 4],
        'curly': ['error', 'all'],
		'linebreak-style': ['error','unix'],
        'block-spacing': ['error', 'always'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
        'eol-last': ['error', 'always'],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'always'],
        'no-unused-vars': ['error', {'args': 'none'}],
        'object-curly-spacing': ['error', 'never'],
        'no-multiple-empty-lines': ['error', {'max': 2}],
        'one-var-declaration-per-line': ['error', 'initializations'],
        'brace-style': ['error', 'stroustrup', {'allowSingleLine': true}],
        'one-var': ['error', {'initialized': 'never'}],
        'padded-blocks': ['error', 'always', { // Use "onlyMultiline" if available.
            'allowSingleLineBlocks': true
        }],
        'keyword-spacing': ['error', {
            'before': true,
            'after': true
        }],
        'operator-linebreak': ['error', 'before', {
            'overrides': {
                '+': 'ignore'
            }
        }],
        'indent': [
            'error',
            4,
            {
                'FunctionDeclaration': {
                    'body': 1,
                    'parameters': 1
                },
                'FunctionExpression': {
                    'body': 1,
                    'parameters': 1
                },
                'flatTernaryExpressions': true,
                'ignoredNodes': ['ConditionalExpression'],
                'ObjectExpression': 1,
                'MemberExpression': 1
            }
        ],
        'padding-line-between-statements': [
            'error',
            {
                'blankLine': 'always',
                'prev': '*',
                'next': 'return'
            },
            {
                'blankLine': 'always',
                'prev': 'var',
                'next': '*'
            },
            {
                'blankLine': 'never',
                'prev': 'var',
                'next': 'var'
            },
            {
                'blankLine': 'always',
                'prev': 'directive',
                'next': '*'
            }
        ],
	}
};
