import React from 'react';
import {concat} from 'ramda';
import {Cell, ErrorBar, Label, LabelList, Text} from 'recharts';

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
    return (
        component &&
        React.createElement(componentType, {
            ...component.props.aspects,
            className: component.props.aspects.class_name,
            id: component.props.aspects.identity,
            children: unwrapChildren(component.props.aspects),
        })
    );
}
