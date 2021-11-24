import {pick} from 'ramda';
import {DataEffectsProps} from './dataEffects';
import {ChartEventHandlerProps} from './eventHandlers';

export type WithReferenceProps = {
    /**
     * Add areas to highlight in the chart, list of charts.ReferenceArea
     */
    reference_areas?: JSX.Element[];
    /**
     * Add charts.ReferenceDot
     */
    reference_dots?: JSX.Element[];
    /**
     * Add charts.ReferenceLine
     */
    reference_lines?: JSX.Element[];
};

export type WithXAxisProps = {
    /**
     * List of charts.XAxis
     */
    x_axis?: JSX.Element[];
}

export type WithYAxisProps = {
    /**
     * List of charts.YAxis
     */
    y_axis?: JSX.Element[];
}

export type WithZAxisProps = {
    /**
     * List of charts.ZAxis.
     */
    z_axis?: JSX.Element[];
}


export type WithBrushProps = {
    /**
     * Add charts.Brush elements.
     */
    brush?: JSX.Element[];
};

export type WithCellsProps = {
    /**
     * Add charts.Cell
     */
    cells?: JSX.Element[];
}

export type WithErrorBarsProps = {
    /**
     * Add charts.ErrorBar
     */
    error_bars?: JSX.Element[];
}

export type WithLabelListsProps = {
    /**
     * Add charts.LabelList
     */
    label_lists?: JSX.Element[];
}

export type WithLabelsProps = {
    /**
     * Add charts.Label
     */
    labels?: JSX.Element;
}

export type WithLayoutProps = {
    /**
     * Layout direction of the items of the chart.
     */
    layout?: 'horizontal' | 'vertical';
}

export type WithPolarProps = {
    /**
     * A charts.PolarGrid component.
     */
    polar_grid?: JSX.Element;
    /**
     * List of charts.PolarAngleAxis
     */
    polar_angle_axis?: JSX.Element[];
    /**
     * List of charts.PolarRadiusAxis
     */
    polar_radius_axis?: JSX.Element[];
}

export type ChartMargin = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export type ChartProps = Partial<{
    /**
     * Data of the chart.
     */
    data: any[];
    /**
     * Width of the chart.
     */
    width: number;
    /**
     * Height of the chart.
     */
    height: number;
    /**
     * Spacing around the chart.
     */
    margin: ChartMargin;
    /**
     * Add a charts.CartesianGrid to the chart.
     */
    cartesian_grid: JSX.Element;
    /**
     * Add a charts.Tooltip to the chart, displaying data on hover.
     */
    tooltip: JSX.Element;
    /**
     * Add a charts.Legend to the chart.
     */
    legend: JSX.Element;
    /**
     * Sync two charts hover with the same id.
     */
    syncId: string;
}> &
    DataEffectsProps &
    ChartEventHandlerProps;

export const chartPropsKey = [
    'data',
    'width',
    'height',
    'margin',
    'syncId',
    'style',
];

export const pickChartProps = pick(chartPropsKey);
