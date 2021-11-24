import React from 'react';
import {PolarAngleAxisProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<PolarAngleAxisProps, HtmlOmittedProps>;

const PolarAngleAxis = (_: Props) => <></>;

export default PolarAngleAxis;
