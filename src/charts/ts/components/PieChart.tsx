import * as React from 'react';
import {DazzlerProps} from '../../../commons/js/types';
import {
    Legend,
    Pie,
    PieChart as RePieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Tooltip,
} from 'recharts';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {DataEffectsProps} from '../dataEffects';
import {ChartProps, pickChartProps, WithPolarProps} from '../chartProps';

type DazzlerPieProps = Omit<
    ChartProps,
    'cartesian_grid' | 'data' | keyof DataEffectsProps
> & {
    /**
     * List of charts.Pie
     */
    pies?: JSX.Element[];
} & WithPolarProps &
    DazzlerProps;

const PieChart = (props: DazzlerPieProps) => {
    const {
        identity,
        class_name,
        tooltip,
        legend,
        pies,
        polar_grid,
        polar_angle_axis,
        polar_radius_axis,
        updateAspects,
    } = props;

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
                {componentType: Pie, components: pies},
                {componentType: PolarAngleAxis, components: polar_angle_axis},
                {componentType: PolarRadiusAxis, components: polar_radius_axis},
            ]}
            chartProps={pickChartProps(props)}
            updateAspects={updateAspects}
            eventHandlers={pickEventHandlerProps(props)}
            chartType={RePieChart}
        />
    );
};

export default PieChart;
