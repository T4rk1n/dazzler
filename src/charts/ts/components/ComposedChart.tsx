import React from 'react';
import {
    Area,
    Bar,
    Brush,
    CartesianGrid,
    ComposedChart as ReComposed,
    Legend,
    Line,
    ReferenceArea,
    ReferenceDot,
    ReferenceLine,
    Scatter,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from 'recharts';

import {
    ChartProps,
    WithReferenceProps,
    pickChartProps,
    WithBrushProps,
    WithZAxisProps,
    WithXAxisProps,
    WithYAxisProps,
} from '../chartProps';
import {DazzlerProps} from '../../../commons/js/types';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type Props = ChartProps & {
    /**
     * Add charts.Area
     */
    areas?: JSX.Element[];
    /**
     * Add charts.Line
     */
    lines?: JSX.Element[];
    /**
     * Add charts.Bar
     */
    bars?: JSX.Element[];
    /**
     * Add charts.Scatter
     */
    scatters?: JSX.Element[];
    bar_category_gap?: number;
    bar_gap?: number;
    bar_size?: number;
    max_bar_size?: number;
    stack_offset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    reverse_stack_order?: boolean;
} & WithXAxisProps &
    WithYAxisProps &
    WithZAxisProps &
    WithReferenceProps &
    WithBrushProps &
    DazzlerProps;

const ComposedChart = (props: Props) => {
    const {
        identity,
        updateAspects,
        class_name,
        x_axis,
        y_axis,
        z_axis,
        legend,
        tooltip,
        cartesian_grid,
        areas,
        lines,
        bars,
        scatters,
        bar_category_gap,
        bar_gap,
        bar_size,
        max_bar_size,
        stack_offset,
        reverse_stack_order,
        reference_areas,
        reference_dots,
        reference_lines,
        brush,
    } = props;
    const chartProps = {
        ...pickChartProps(props),
        barCategoryGap: bar_category_gap,
        barGap: bar_gap,
        barSize: bar_size,
        maxBarSize: max_bar_size,
        stackOffset: stack_offset,
        reverseStackOrder: reverse_stack_order,
    };
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReComposed}
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
                {components: z_axis, componentType: ZAxis},
                {components: areas, componentType: Area},
                {components: bars, componentType: Bar},
                {components: lines, componentType: Line},
                {components: scatters, componentType: Scatter},
                {components: brush, componentType: Brush},
                {componentType: ReferenceArea, components: reference_areas},
                {componentType: ReferenceDot, components: reference_dots},
                {componentType: ReferenceLine, components: reference_lines},
            ]}
            updateAspects={updateAspects}
        />
    );
};

export default ComposedChart;
