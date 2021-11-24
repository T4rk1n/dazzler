import * as React from 'react';
import {
    Brush,
    CartesianGrid,
    Legend,
    ReferenceArea,
    ReferenceDot,
    ReferenceLine,
    Scatter,
    ScatterChart as ReScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from 'recharts';
import {DazzlerProps} from '../../../commons/js/types';
import BaseChart from '../BaseChart';
import {
    ChartProps,
    pickChartProps,
    WithBrushProps,
    WithReferenceProps,
    WithXAxisProps,
    WithYAxisProps,
    WithZAxisProps,
} from '../chartProps';
import {pickEventHandlerProps} from '../eventHandlers';
import {DataEffectsProps, pickDataEffectsProps} from '../dataEffects';

type DazzlerScatterProps = Omit<ChartProps, 'data' | keyof DataEffectsProps> & {
    /**
     * List of charts.Scatter
     */
    scatters?: JSX.Element[];
} & WithXAxisProps &
    WithYAxisProps &
    WithZAxisProps &
    WithReferenceProps &
    WithBrushProps &
    DazzlerProps;

const ScatterChart = (props: DazzlerScatterProps) => {
    const {
        class_name,
        identity,
        cartesian_grid,
        tooltip,
        y_axis,
        x_axis,
        z_axis,
        legend,
        scatters,
        updateAspects,
        reference_areas,
        reference_lines,
        reference_dots,
        brush,
    } = props;

    // TODO support Data effects on scatters.
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            singleWraps={[
                {component: cartesian_grid, componentType: CartesianGrid},
                {component: legend, componentType: Legend},
                {component: tooltip, componentType: Tooltip},
            ]}
            multiWraps={[
                {components: x_axis, componentType: XAxis},
                {components: y_axis, componentType: YAxis},
                {components: z_axis, componentType: ZAxis},
                {components: brush, componentType: Brush},
                {componentType: Scatter, components: scatters},
                {componentType: ReferenceArea, components: reference_areas},
                {componentType: ReferenceDot, components: reference_dots},
                {componentType: ReferenceLine, components: reference_lines},
            ]}
            chartProps={pickChartProps(props)}
            updateAspects={updateAspects}
            dataEffects={pickDataEffectsProps(props)}
            eventHandlers={pickEventHandlerProps(props)}
            chartType={ReScatterChart}
        />
    );
};

export default ScatterChart;
