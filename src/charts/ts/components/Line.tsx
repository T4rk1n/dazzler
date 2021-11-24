import React from 'react';
import {LineProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';
import {WithErrorBarsProps, WithLabelListsProps} from '../chartProps';

type Props = Omit<LineProps, HtmlOmittedProps> &
    WithLabelListsProps &
    WithErrorBarsProps;

const Line = (_: Props) => {
    return <></>;
};

export default Line;
