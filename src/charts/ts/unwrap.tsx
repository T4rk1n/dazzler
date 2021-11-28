import React, {useReducer} from 'react';
import {concat, keys, mergeRight} from 'ramda';
import {Cell, ErrorBar, Label, LabelList, Text} from 'recharts';
import {AnyDict} from '../../commons/js/types';

function unwrapChildren(aspects) {
    let children = [];
    const {labels, label_lists, cells, texts, error_bars} = aspects;
    if (labels) {
        children = children.concat(
            labels.map((label) => <Label {...label.props.aspects} />)
        );
    }
    if (label_lists) {
        children = concat(
            children,
            label_lists.map((label) => <LabelList {...label.props.aspects} />)
        );
    }
    if (cells) {
        children = children.concat(
            cells.map((cell) => <Cell {...cell.props.aspects} />)
        );
    }
    if (texts) {
        children = children.concat(
            texts.map((text) => <Text {...text.props.aspects} />)
        );
    }
    if (error_bars) {
        children = children.concat(
            error_bars.map((bar) => <ErrorBar {...bar.props.aspects} />)
        );
    }
    return children;
}

function aspectReducer(state: AnyDict, action: AnyDict) {
    return mergeRight(state, action);
}

/**
 * Take a dazzler Wrapper and return a raw component from the aspects.
 *
 * Recharts children of charts must not be wrapped, there is also
 * issues with refs.
 *
 * @param component The Wrapper component to unwrap
 * @param componentType The type of component to return.
 */
export function unwrapComponent(component, componentType) {
    const [aspects, setAspects] = useReducer(
        aspectReducer,
        component?.props.aspects
    );
    if (!component) {
        return null;
    }
    const {identity} = component.props;
    // Manually connect the component so it can be updated.
    component.props.connect(
        identity,
        (aspects) =>
            new Promise<void>((resolve) => {
                setAspects(aspects);
                resolve();
            }),
        (aspect) => aspects[aspect],
        (pattern) =>
            keys(aspects)
                .filter((k) => pattern.test(k))
                .map((k) => [k, aspects[k]]),
        (aspects) => component.props.updateAspects(identity, aspects)
    );

    return React.createElement(componentType, {
        ...aspects,
        className: aspects.class_name,
        id: identity,
        children: unwrapChildren(aspects),
    });
}
