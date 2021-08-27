import {has, is} from 'ramda';
import {Aspect, TransformGetAspectFunc} from './types';

export const isAspect = (obj: any): boolean =>
    is(Object, obj) && has('identity', obj) && has('aspect', obj);

export const coerceAspect = (
    obj: any,
    getAspect: TransformGetAspectFunc
): any => (isAspect(obj) ? getAspect(obj.identity, obj.aspect) : obj);

export const getAspectKey = (identity: string, aspect: string): string =>
    `${aspect}@${identity}`;

export const isSameAspect = (a: Aspect, b: Aspect) =>
    a.identity === b.identity && a.aspect === b.aspect
