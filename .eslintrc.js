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
		'indent': ['error', 4],
		'linebreak-style': ['error','unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
        'object-curly-spacing': ['error', 'never'],
        'no-whitespace-before-property': 'error',
        'operator-linebreak': ['error', 'before', {
            'overrides': {
                '+': 'ignore'
            }
        }],
        'space-before-function-paren': ['error', 'always'],
        'no-unused-vars': ['error', {'args': 'none'}],
        // 'padded-blocks': ['error', 'never'/* 'multiline' */],
        'no-trailing-spaces': 'error',
        'no-underscore-dangle': 'error',
        'curly': ['error', 'all'],
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
                'ObjectExpression': 1,
                'MemberExpression': 1
            }
        ],
        'padding-line-between-statements': [
            'error',
            {
                'blankLine': 'always',
                'prev': ['expression', 'var'],
                'next': 'return'
            },
            {
                'blankLine': 'always',
                'prev': 'var',
                'next': ['expression', 'return']
            },
            {
                'blankLine': 'never',
                'prev': 'var',
                'next': 'var'
            },
            {
                'blankLine': 'always',
                'prev': ['block-like', 'block'],
                'next': '*'
            },
            {
                'blankLine': 'always',
                'prev': '*',
                'next': ['block-like', 'block']
            }
        ],
        'no-multiple-empty-lines': ['error', {
            'max': 2
        }]
	}
};