import type { Config } from 'stylelint';

export default <Config>{
    extends: ['stylelint-config-standard-scss'],
    ignoreFiles: ['**/node_modules/**', 'dist/**'],
    rules: {
        'prettier/prettier': true,
    },
    plugins: ['stylelint-prettier'],
};
