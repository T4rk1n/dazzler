import React, {memo} from 'react';
import {
    ResponsiveContainerProps,
    ResponsiveContainer as ReResponsiveContainer,
} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';
import {omit} from 'ramda';

type Props = Omit<ResponsiveContainerProps, HtmlOmittedProps> & {
    children: JSX.Element;
};

const ResponsiveContainer = ({children, ...props}: Props) => (
    <ReResponsiveContainer
        {...omit(['class_name', 'identity', 'style', 'updateAspects'], props)}
    >
        {children}
    </ReResponsiveContainer>
);

export default memo(ResponsiveContainer);
