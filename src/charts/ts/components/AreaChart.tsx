import React from 'react';
import {
    Area,
    AreaChart as ReAreaChart,
    Brush,
    CartesianGrid,
    Legend,
    ReferenceArea,
    ReferenceDot,
    ReferenceLine,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {DazzlerProps} from '../../../commons/js/types';
import {
    ChartProps,
    WithReferenceProps,
    pickChartProps,
    WithBrushProps,
    WithXAxisProps,
    WithYAxisProps,
    WithLayoutProps,
} from '../chartProps';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type Props = ChartProps & {
    /**
     * List of charts.Area
     */
    areas?: JSX.Element[];
    stack_offset?: 'expand' | 'none' | 'wiggle' | 'silhouette';
} & WithLayoutProps &
    WithReferenceProps &
    WithXAxisProps &
    WithYAxisProps &
    WithBrushProps &
    DazzlerProps;

const AreaChart = (props: Props) => {
    const {
        class_name,
        identity,
        tooltip,
        y_axis,
        x_axis,
        legend,
        cartesian_grid,
        areas,
        reference_areas,
        reference_dots,
        reference_lines,
        brush,
        updateAspects,
        layout,
        stack_offset,
    } = props;

    const chartProps = {
        ...pickChartProps(props),
        layout,
        stackOffset: stack_offset,
    };

    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReAreaChart}
            dataEffects={pickDataEffectsProps(props)}
            eventHandlers={pickEventHandlerProps(props)}
            singleWraps={[
                {component: legend, componentType: Legend},
                {component: tooltip, componentType: Tooltip},
                {component: cartesian_grid, componentType: CartesianGrid},
            ]}
            multiWraps={[
                {components: x_axis, componentType: XAxis},
                {components: y_axis, componentType: YAxis},
                {components: areas, componentType: Area},
                {components: brush, componentType: Brush},
                {componentType: ReferenceArea, components: reference_areas},
                {componentType: ReferenceDot, components: reference_dots},
                {componentType: ReferenceLine, components: reference_lines},
            ]}
            updateAspects={updateAspects}
        />
    );
};

export default AreaChart;
