import {AnyDict, CommonPresetsProps} from './types';
import {join, mergeRight, pick} from 'ramda';
import {snakeToCamelCase, transformKeys} from './casing';
import {collectTruePropKeys} from './utils';

const commonStyles = [
    'color',
    'background',
    'padding',
    'margin',
    'overflow',
    'height',
    'max_height',
    'width',
    'max_width',
    'font_family',
    'font_size',
    'font_style',
    'font_weight',
    'text_align',
    'border',
    'border_radius',
    'flex_grow',
    'flex_shrink',
    'align_self',
    'display',
];

const booleanPresets = [
    'rounded',
    'bordered',
    'centered',
    'scrollable',
    'hidden',
    'unselectable',
];

const commonPresets = booleanPresets.concat([
    'preset_color',
    'preset_background',
    'preset_size',
]);
const prefix = 'dazzler';

export function getCommonStyles(obj: AnyDict, mergable?: AnyDict): AnyDict {
    return mergeRight(
        transformKeys(pick(commonStyles, obj), snakeToCamelCase),
        mergable || {}
    );
}

export function getPresetsClassNames(
    obj: AnyDict,
    ...classNames: string[]
): string {
    const presets: CommonPresetsProps = pick(commonPresets, obj);
    const css = collectTruePropKeys(presets, booleanPresets);
    if (presets.preset_color) {
        css.push(`preset-color-${presets.preset_color}`);
    }
    if (presets.preset_size) {
        css.push(`preset-size-${presets.preset_size}`);
    }
    if (presets.preset_background) {
        css.push(`preset-background-${presets.preset_background}`);
    }
    return join(' ', css.map((p) => join('-', [prefix, p])).concat(classNames));
}
