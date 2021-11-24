import React from 'react';
import {PolarGridProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<PolarGridProps, HtmlOmittedProps>;

const PolarGrid = (_: Props) => <></>;

export default PolarGrid;
