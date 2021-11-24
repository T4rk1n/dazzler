import React, {SVGProps} from 'react';
import {Sankey as ReSankey, Tooltip} from 'recharts';

import {ChartProps} from '../chartProps';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import BaseChart from '../BaseChart';
import {pickEventHandlerProps} from '../eventHandlers';
import {DataEffectsProps} from '../dataEffects';

type Props = Omit<
    ChartProps,
    'cartesian_grid' | 'legend' | 'data' | keyof DataEffectsProps
> &
    Omit<SVGProps<any>, HtmlOmittedProps> & {
        dataKey?: string;
        nameKey?: string;
        nodePadding?: number;
        nodeWidth?: number;
        linkWidth?: number;
        linkCurvature?: number;
        iterations?: number;
        node?: object | JSX.Element;
        link?: object | JSX.Element;
        sourceX?: number;
        sourceY?: number;
        sourceControlX?: number;
        targetControlX?: number;
        targetX?: number;
        targetY?: number;
        data?: any;
    } & DazzlerProps;

const SankeyChart = (props: Props) => {
    const {identity, class_name, updateAspects, tooltip, ...chartProps} = props;
    return (
        <BaseChart
            identity={identity}
            className={class_name}
            chartProps={chartProps}
            chartType={ReSankey}
            eventHandlers={pickEventHandlerProps(props)}
            singleWraps={[{component: tooltip, componentType: Tooltip}]}
            multiWraps={[]}
            updateAspects={updateAspects}
        />
    );
};

export default SankeyChart;
