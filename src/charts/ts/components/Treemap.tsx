import React, {SVGProps} from 'react';
import {Treemap as ReTreemap} from 'recharts';

import {ChartProps} from '../chartProps';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {pickDataEffectsProps} from '../dataEffects';

type Props = Omit<ChartProps, 'cartesian_grid' | 'tooltip' | 'legend'> &
    Omit<SVGProps<any>, HtmlOmittedProps> & {
        dataKey: string;
        aspectRatio: number;
        isAnimationActive?: boolean;
        animationBegin?: number;
        animationDuration?: number;
        animationEasing?:
            | 'ease'
            | 'ease-in'
            | 'ease-out'
            | 'ease-in-out'
            | 'linear';
    } & DazzlerProps;

const Treemap = (props: Props) => {
    const {identity, class_name, updateAspects, ...chartProps} = props;
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReTreemap}
            dataEffects={pickDataEffectsProps(props)}
            eventHandlers={pickEventHandlerProps(props)}
            singleWraps={[]}
            multiWraps={[]}
            updateAspects={updateAspects}
        />
    );
};

export default Treemap;
