import '../scss/index.scss';

import {
    timestampProp,
    loadCss,
    loadScript,
    debounce,
    collectTruePropKeys,
    chunk,
    toTimestamp,
    disableCss,
} from './utils';
import {
    camelToSnakeCase,
    camelToSpinal,
    snakeToCamelCase,
    transformKeys,
} from './casing';
import {getCommonStyles, getPresetsClassNames} from './styling';

export {
    toTimestamp,
    timestampProp,
    loadCss,
    loadScript,
    debounce,
    snakeToCamelCase,
    camelToSnakeCase,
    camelToSpinal,
    transformKeys,
    collectTruePropKeys,
    chunk,
    disableCss,
    getCommonStyles,
    getPresetsClassNames,
};
