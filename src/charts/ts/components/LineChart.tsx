import * as React from 'react';
import {
    LineChart as ReLineChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceArea,
    ReferenceLine,
    ReferenceDot,
    Brush,
    Line,
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

type DazzlerLineProps = ChartProps & {
    /**
     * List of charts.Line
     */
    lines: JSX.Element[];
} & WithLayoutProps &
    WithReferenceProps &
    WithXAxisProps &
    WithYAxisProps &
    WithBrushProps &
    DazzlerProps;

const LineChart = (props: Partial<DazzlerLineProps>) => {
    const {
        class_name,
        identity,
        cartesian_grid,
        tooltip,
        y_axis,
        x_axis,
        legend,
        lines,
        reference_areas,
        reference_dots,
        reference_lines,
        brush,
        layout,
        updateAspects,
    } = props;

    const chartProps = {...pickChartProps(props), layout};

    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReLineChart}
            dataEffects={pickDataEffectsProps(props)}
            eventHandlers={pickEventHandlerProps(props)}
            singleWraps={[
                {component: legend, componentType: Legend},
                {component: tooltip, componentType: Tooltip},
                {component: cartesian_grid, componentType: CartesianGrid},
            ]}
            multiWraps={[
                {components: lines, componentType: Line},
                {components: x_axis, componentType: XAxis},
                {components: y_axis, componentType: YAxis},
                {components: brush, componentType: Brush},
                {componentType: ReferenceArea, components: reference_areas},
                {componentType: ReferenceDot, components: reference_dots},
                {componentType: ReferenceLine, components: reference_lines},
            ]}
            updateAspects={updateAspects}
        />
    );
};

export default LineChart;
