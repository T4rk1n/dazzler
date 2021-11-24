import * as React from 'react';
import {LegendProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<LegendProps, HtmlOmittedProps | 'payload' | 'payloadUniqBy'> &
    DazzlerProps;

const Legend = (_: Props) => <></>;

export default Legend;
