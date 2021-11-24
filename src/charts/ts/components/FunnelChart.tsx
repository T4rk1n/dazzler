import React from 'react';
import {Funnel, FunnelChart as ReFunnelChart, Legend, Tooltip} from 'recharts';
import {DazzlerProps} from '../../../commons/js/types';
import {unwrapComponent} from '../unwrap';
import {ChartProps} from '../chartProps';

type Props = Omit<ChartProps, 'data' | 'sync_id' | 'cartesian_grid'> & {
    funnels?: JSX.Element[];
} & DazzlerProps;

const FunnelChart = (props: Props) => {
    const {
        width,
        height,
        margin,
        class_name,
        style,
        identity,
        legend,
        tooltip,
        funnels,
    } = props;
    return (
        <ReFunnelChart
            id={identity}
            className={class_name}
            style={style}
            height={height}
            width={width}
            margin={margin}
        >
            {unwrapComponent(legend, Legend)}
            {unwrapComponent(tooltip, Tooltip)}
            {funnels &&
                funnels.map((funnel) => unwrapComponent(funnel, Funnel))}
        </ReFunnelChart>
    );
};

export default FunnelChart;
