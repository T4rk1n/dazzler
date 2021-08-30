/* eslint-disable no-use-before-define */
import {
    concat,
    drop,
    equals,
    find,
    fromPairs,
    includes,
    is,
    join,
    mergeDeepLeft,
    mergeDeepRight,
    mergeLeft,
    mergeRight,
    pick,
    pluck,
    reduce,
    replace,
    reverse,
    slice,
    sort,
    split,
    take,
    toPairs,
    trim,
    uniq,
    zip,
} from 'ramda';
import {Transform, TransformFunc, TransformGetAspectFunc} from './types';
import {coerceAspect, isAspect} from './aspects';

const transforms: {[key: string]: TransformFunc} = {
    /* String transforms */
    ToUpper: (value) => {
        return value.toUpperCase();
    },
    ToLower: (value) => {
        return value.toLowerCase();
    },
    Format: (value, args) => {
        const {template} = args;
        if (is(String, value) || is(Number, value) || is(Boolean, value)) {
            return replace('${value}', value, template);
        } else if (is(Object, value)) {
            return reduce(
                (acc, [k, v]) => replace(`$\{${k}}`, v, acc),
                template,
                toPairs(value)
            );
        }
        return value;
    },
    Split: (value, args) => {
        const {separator} = args;
        return split(separator, value);
    },
    Trim: (value) => {
        return trim(value);
    },
    /* Number Transform */
    Add: (value, args, getAspect) => {
        if (is(Number, args.value)) {
            return value + args.value;
        }
        return value + coerceAspect(args.value, getAspect);
    },
    Sub: (value, args, getAspect) => {
        if (is(Number, args.value)) {
            return value - args.value;
        }
        return value - coerceAspect(args.value, getAspect);
    },
    Divide: (value, args, getAspect) => {
        if (is(Number, args.value)) {
            return value / args.value;
        }
        return value / coerceAspect(args.value, getAspect);
    },
    Multiply: (value, args, getAspect) => {
        if (is(Number, args.value)) {
            return value * args.value;
        }
        return value * coerceAspect(args.value, getAspect);
    },
    Modulus: (value, args, getAspect) => {
        if (is(Number, args.value)) {
            return value % args.value;
        }
        return value % coerceAspect(args.value, getAspect);
    },
    ToPrecision: (value, args) => {
        return value.toPrecision(args.precision);
    },
    /* Array transforms  */
    Concat: (value, args, getAspect) => {
        const {other} = args;
        return concat(value, coerceAspect(other, getAspect));
    },
    Slice: (value, args) => {
        return slice(args.start, args.stop, value);
    },
    Map: (value, args, getAspect) => {
        const {transform} = args;
        return value.map((e) =>
            executeTransform(
                transform.transform,
                e,
                transform.args,
                transform.next,
                getAspect
            )
        );
    },
    Filter: (value, args, getAspect) => {
        const {comparison} = args;
        return value.filter((e) =>
            executeTransform(
                comparison.transform,
                e,
                comparison.args,
                comparison.next,
                getAspect
            )
        );
    },
    Reduce: (value, args, getAspect) => {
        const {transform, accumulator} = args;
        const acc = coerceAspect(accumulator, getAspect);
        return value.reduce(
            (previous, next) =>
                executeTransform(
                    transform.transform,
                    [previous, next],
                    transform.args,
                    transform.next,
                    getAspect
                ),
            acc
        );
    },
    Pluck: (value, args) => {
        const {field} = args;
        return pluck(field, value);
    },
    Append: (value, args, getAspect) => {
        return concat(value, [coerceAspect(args.value, getAspect)]);
    },
    Prepend: (value, args, getAspect) => {
        return concat([coerceAspect(args.value, getAspect)], value);
    },
    Insert: (value, args, getAspect) => {
        const {target, front} = args;
        const t = coerceAspect(target, getAspect);
        return front ? concat([value], t) : concat(t, [value]);
    },
    Take: (value, args, getAspect) => {
        const {n} = args;
        return take(coerceAspect(n, getAspect), value);
    },
    Length: (value) => {
        return value.length;
    },
    Range: (value, args, getAspect) => {
        const {start, end, step} = args;
        const s = coerceAspect(start, getAspect);
        const e = coerceAspect(end, getAspect);
        let i = s;
        const arr = [];
        while (i < e) {
            arr.push(i);
            i += step;
        }
        return arr;
    },
    Includes: (value, args, getAspect) => {
        return includes(coerceAspect(args.value, getAspect), value);
    },
    Find: (value, args, getAspect) => {
        const {comparison} = args;
        return find((a) =>
            executeTransform(
                comparison.transform,
                a,
                comparison.args,
                comparison.next,
                getAspect
            )
        )(value);
    },
    Join: (value, args, getAspect) => {
        return join(coerceAspect(args.separator, getAspect), value);
    },
    Sort: (value, args, getAspect) => {
        const {transform} = args;
        return sort(
            (a, b) =>
                executeTransform(
                    transform.transform,
                    [a, b],
                    transform.args,
                    transform.next,
                    getAspect
                ),
            value
        );
    },
    Reverse: (value) => {
        return reverse(value);
    },
    Unique: (value) => {
        return uniq(value);
    },
    Zip: (value, args, getAspect) => {
        return zip(value, coerceAspect(args.value, getAspect));
    },
    /* Object transforms */
    Pick: (value, args) => {
        return pick(args.fields, value);
    },
    Get: (value, args) => {
        return value[args.field];
    },
    Set: (v, args, getAspect) => {
        const {key, value} = args;
        v[key] = coerceAspect(value, getAspect);
        return v;
    },
    Put: (value, args, getAspect) => {
        const {key, target} = args;
        const obj = coerceAspect(target, getAspect);
        obj[key] = value;
        return obj;
    },
    Merge: (value, args, getAspect) => {
        const {deep, direction, other} = args;
        let otherValue = other;
        if (isAspect(other)) {
            otherValue = getAspect(other.identity, other.aspect);
        }
        if (direction === 'right') {
            if (deep) {
                return mergeDeepRight(value, otherValue);
            }
            return mergeRight(value, otherValue);
        }
        if (deep) {
            return mergeDeepLeft(value, otherValue);
        }
        return mergeLeft(value, otherValue);
    },
    ToJson: (value) => {
        return JSON.stringify(value);
    },
    FromJson: (value) => {
        return JSON.parse(value);
    },
    ToPairs: (value) => {
        return toPairs(value);
    },
    FromPairs: (value) => {
        return fromPairs(value);
    },
    /* Conditionals */
    If: (value, args, getAspect) => {
        const {comparison, then, otherwise} = args;
        const c = transforms[comparison.transform];

        if (c(value, comparison.args, getAspect)) {
            return executeTransform(
                then.transform,
                value,
                then.args,
                then.next,
                getAspect
            );
        }
        if (otherwise) {
            return executeTransform(
                otherwise.transform,
                value,
                otherwise.args,
                otherwise.next,
                getAspect
            );
        }
        return value;
    },
    Equals: (value, args, getAspect) => {
        return equals(value, coerceAspect(args.other, getAspect));
    },
    NotEquals: (value, args, getAspect) => {
        return !equals(value, coerceAspect(args.other, getAspect));
    },
    Match: (value, args, getAspect) => {
        const r = new RegExp(coerceAspect(args.other, getAspect));
        return r.test(value);
    },
    Greater: (value, args, getAspect) => {
        return value > coerceAspect(args.other, getAspect);
    },
    GreaterOrEquals: (value, args, getAspect) => {
        return value >= coerceAspect(args.other, getAspect);
    },
    Lesser: (value, args, getAspect) => {
        return value < coerceAspect(args.other, getAspect);
    },
    LesserOrEquals: (value, args, getAspect) => {
        return value <= coerceAspect(args.other, getAspect);
    },
    And: (value, args, getAspect) => {
        return value && coerceAspect(args.other, getAspect);
    },
    Or: (value, args, getAspect) => {
        return value || coerceAspect(args.other, getAspect);
    },
    Not: (value) => {
        return !value;
    },
    RawValue: (value, args) => {
        return args.value;
    },
    AspectValue: (value, args, getAspect) => {
        const {identity, aspect} = args.target;
        return getAspect(identity, aspect);
    },
};

export const executeTransform = (
    transform: string,
    value: any,
    args: any,
    next: Array<Transform>,
    getAspect: TransformGetAspectFunc
) => {
    const t = transforms[transform];
    const newValue = t(value, args, getAspect);
    if (next.length) {
        const n = next[0];
        return executeTransform(
            n.transform,
            newValue,
            n.args,
            // Execute the next first, then back to chain.
            concat(n.next, drop(1, next)),
            getAspect
        );
    }
    return newValue;
};

export default transforms;
