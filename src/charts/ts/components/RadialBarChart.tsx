import React from 'react';
import {
    Legend,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart as ReRadialBarChart,
    Tooltip,
} from 'recharts';
import {DazzlerProps} from '../../../commons/js/types';
import {ChartProps, pickChartProps, WithPolarProps} from '../chartProps';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type Props = ChartProps & {
    /**
     * List of charts.RadialBar
     */
    radial_bars?: JSX.Element[];
    bar_category_gap?: number | string;
    bar_gap?: number | string;
    bar_size?: number | string;
    inner_radius?: number;
    outer_radius?: number;
    cx?: number | string;
    cy?: number | string;
    start_angle?: number;
    end_angle?: number;
} & WithPolarProps &
    DazzlerProps;

const RadialBarChart = (props: Props) => {
    const {
        class_name,
        identity,
        legend,
        tooltip,
        polar_angle_axis,
        radial_bars,
        polar_grid,
        polar_radius_axis,
        updateAspects,
        bar_category_gap,
        bar_gap,
        bar_size,
        inner_radius,
        outer_radius,
        cx,
        cy,
        start_angle,
        end_angle,
    } = props;
    const chartProps = {
        ...pickChartProps(props),
        innerRadius: inner_radius,
        outerRadius: outer_radius,
        cx,
        cy,
        startAngle: start_angle,
        endAngle: end_angle,
        barCategoryGap: bar_category_gap,
        barGap: bar_gap,
        barSize: bar_size,
    };
    return (
        <BaseChart
            identity={identity}
            chartProps={chartProps}
            chartType={ReRadialBarChart}
            dataEffects={pickDataEffectsProps(props)}
            className={class_name}
            eventHandlers={pickEventHandlerProps(props)}
            singleWraps={[
                {componentType: Legend, component: legend},
                {componentType: Tooltip, component: tooltip},
                {componentType: PolarGrid, component: polar_grid},
            ]}
            multiWraps={[
                {componentType: RadialBar, components: radial_bars},
                {componentType: PolarAngleAxis, components: polar_angle_axis},
                {componentType: PolarRadiusAxis, components: polar_radius_axis},
            ]}
            updateAspects={updateAspects}
        />
    );
};

export default RadialBarChart;
