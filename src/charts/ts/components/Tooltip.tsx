import * as React from 'react';
import {TooltipProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = DazzlerProps & Omit<TooltipProps<any, any>, HtmlOmittedProps>;

const Tooltip = (_: Props) => {
    return <></>;
};

export default Tooltip;
