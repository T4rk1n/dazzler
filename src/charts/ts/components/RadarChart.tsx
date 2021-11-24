import React from 'react';
import {
    Legend,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart as ReRadarChart,
    Tooltip,
} from 'recharts';
import {DazzlerProps} from '../../../commons/js/types';
import {ChartProps, pickChartProps, WithPolarProps} from '../chartProps';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type Props = Omit<ChartProps, 'cartesian_grid'> & {
    /**
     * List of charts.Radar
     */
    radars?: JSX.Element[];
    inner_radius?: number;
    outer_radius?: number;
    cx?: number | string;
    cy?: number | string;
    start_angle?: number;
    end_angle?: number;
} & WithPolarProps &
    DazzlerProps;

const RadarChart = (props: Props) => {
    const {
        legend,
        tooltip,
        polar_angle_axis,
        radars,
        polar_grid,
        polar_radius_axis,
        updateAspects,
        identity,
        class_name,
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
    };
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            singleWraps={[
                {componentType: Legend, component: legend},
                {componentType: Tooltip, component: tooltip},
                {componentType: PolarGrid, component: polar_grid},
            ]}
            multiWraps={[
                {componentType: Radar, components: radars},
                {componentType: PolarAngleAxis, components: polar_angle_axis},
                {componentType: PolarRadiusAxis, components: polar_radius_axis},
            ]}
            dataEffects={pickDataEffectsProps(props)}
            eventHandlers={pickEventHandlerProps(props)}
            chartProps={chartProps}
            chartType={ReRadarChart}
            updateAspects={updateAspects}
        />
    );
};

export default RadarChart;
