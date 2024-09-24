import antfu from '@antfu/eslint-config'

export default antfu({
    stylistic: {
        indent: 4,
    },
    ignores: ['.github', '*.yaml'],
    yaml: false,
    jsonc: false,
    regexp: false,
    rules: {
        'ts/consistent-type-definitions': ['off', 'always'],
        'node/prefer-global/process': ['off', 'always'],
        'style/member-delimiter-style': ['off', 'always'],
    },
})
