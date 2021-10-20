import {DazzlerHtmlProps, UpdateAspectFunc} from './types';
import {assoc, omit, pipe, pick} from 'ramda';

const omittedProps = [
    'class_name',
    'identity',
    'updateAspects',
    'handle_clicks',
    'clicks',
    'handle_hover',
    'is_hovered',
    'handle_load',
    'is_loaded',
    'handle_keys',
    'last_key',
    'handle_focus',
    'is_focused',
];

const clickKeys = [
    'altKey',
    'button',
    'buttons',
    'clientX',
    'clientY',
    'ctrlKey',
    'metaKey',
    'movementX',
    'movementY',
    'offsetX',
    'offsetY',
    'pageX',
    'pageY',
    'screenX',
    'screenY',
    'shiftKey',
    'x',
    'y',
];

const onClick =
    (clicks: number, updateAspects: UpdateAspectFunc) => (event: MouseEvent) =>
        updateAspects({
            clicks: (clicks || 0) + 1,
            click_event: pick(clickKeys, event),
        });

const updateFactory =
    <T>(key: string, value: T, updateAspects: UpdateAspectFunc) =>
    () =>
        updateAspects({[key]: value});

export function enhanceProps(props: DazzlerHtmlProps) {
    let newProps: any = {
        ...omit(omittedProps, props),
        className: props.class_name,
        id: props.id || props.identity,
    };
    if (props.handle_clicks) {
        newProps = assoc(
            'onClick',
            onClick(props.clicks, props.updateAspects),
            newProps
        );
    }
    if (props.handle_hover) {
        newProps = pipe(
            assoc(
                'onMouseEnter',
                updateFactory('is_hovered', true, props.updateAspects)
            ),
            assoc(
                'onMouseLeave',
                updateFactory('is_hovered', false, props.updateAspects)
            )
        )(newProps);
    }
    if (props.handle_focus) {
        newProps = pipe(
            assoc(
                'onFocus',
                updateFactory('is_focused', true, props.updateAspects)
            ),
            assoc(
                'onBlur',
                updateFactory('is_focused', false, props.updateAspects)
            )
        )(newProps);
    }
    return newProps;
}
