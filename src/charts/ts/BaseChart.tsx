import {UpdateAspectFunc} from '../../commons/js/types';
import dataEffectsFactory, {DataEffectsProps} from './dataEffects';
import React, {useEffect} from 'react';
import {unwrapComponent} from './unwrap';
import {
    chartEventHandlerFactory,
    ChartEventHandlerProps,
} from './eventHandlers';
import {isEmpty} from 'ramda';

type WrappedPart = {
    component: any;
    componentType: any;
};

type BaseChartProps = {
    identity: string;
    className?: string;
    singleWraps: WrappedPart[];
    multiWraps: {componentType: any; components: any[]}[];
    chartProps: any;
    updateAspects: UpdateAspectFunc;
    dataEffects?: DataEffectsProps;
    eventHandlers: ChartEventHandlerProps;
    chartType: any;
    otherChildren?: JSX.Element[];
};

const BaseChart = (props: BaseChartProps) => {
    const {
        identity,
        className,
        chartProps,
        chartType,
        singleWraps,
        multiWraps,
        updateAspects,
        dataEffects,
        eventHandlers,
        otherChildren,
    } = props;
    const {data} = chartProps;

    const effects = dataEffectsFactory(updateAspects);

    useEffect(effects.append_data(dataEffects.append_data, data), [
        dataEffects.append_data,
        data,
    ]);
    useEffect(effects.prepend_data(dataEffects.prepend_data, data), [
        dataEffects.prepend_data,
        data,
    ]);
    useEffect(effects.concat_data(dataEffects.concat_data, data), [
        dataEffects.concat_data,
        data,
    ]);
    useEffect(effects.delete_data(dataEffects.delete_data, data), [
        dataEffects.delete_data,
        data,
    ]);
    useEffect(effects.insert_data(dataEffects.insert_data, data), [
        dataEffects.insert_data,
        data,
    ]);
    useEffect(effects.sort_data(dataEffects.sort_data, data), [
        dataEffects.sort_data,
        data,
    ]);

    let children = singleWraps.map((wrap) =>
        unwrapComponent(wrap.component, wrap.componentType)
    );
    multiWraps.forEach((wraps) => {
        if (!wraps.components || isEmpty(wraps.components)) {
            return;
        }
        children = children.concat(
            wraps.components.map((component) =>
                unwrapComponent(component, wraps.componentType)
            )
        );
    });
    if (otherChildren) {
        children = children.concat(otherChildren);
    }

    const handlers = chartEventHandlerFactory(updateAspects, eventHandlers);

    const chart = {
        ...chartProps,
        ...handlers,
        children,
        className,
        id: identity,
    };
    return React.createElement(chartType, chart);
};

BaseChart.defaultProps = {
    dataEffects: {},
};

export default BaseChart;
