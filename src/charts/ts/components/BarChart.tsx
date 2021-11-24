import React from 'react';
import {
    Bar,
    BarChart as ReBarChart,
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
    pickChartProps,
    WithBrushProps,
    WithLayoutProps,
    WithReferenceProps,
    WithXAxisProps,
    WithYAxisProps,
} from '../chartProps';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type DazzlerBarProps = ChartProps & {
    /**
     * List of charts.Bar
     */
    bars?: JSX.Element[];
    bar_category_gap?: number;
    bar_gap?: number;
    bar_size?: number;
    max_bar_size?: number;
    stack_offset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    reverse_stack_order?: boolean;
} & WithLayoutProps &
    WithReferenceProps &
    WithBrushProps &
    WithYAxisProps &
    WithXAxisProps &
    DazzlerProps;

const BarChart = (props: DazzlerBarProps) => {
    const {
        class_name,
        identity,
        tooltip,
        y_axis,
        x_axis,
        bars,
        legend,
        bar_category_gap,
        bar_gap,
        bar_size,
        layout,
        max_bar_size,
        stack_offset,
        reverse_stack_order,
        reference_areas,
        reference_dots,
        reference_lines,
        brush,
        updateAspects,
        cartesian_grid,
    } = props;
    const chartProps = {
        ...pickChartProps(props),
        barCategoryGap: bar_category_gap,
        barGap: bar_gap,
        barSize: bar_size,
        maxBarSize: max_bar_size,
        stackOffset: stack_offset,
        reverseStackOrder: reverse_stack_order,
        layout,
    };
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReBarChart}
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
                {components: bars, componentType: Bar},
                {components: brush, componentType: Brush},
                {componentType: ReferenceArea, components: reference_areas},
                {componentType: ReferenceDot, components: reference_dots},
                {componentType: ReferenceLine, components: reference_lines},
            ]}
            updateAspects={updateAspects}
        />
    );
};

export default BarChart;
