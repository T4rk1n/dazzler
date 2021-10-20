import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGStopElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Stop = (props: Props) => <stop {...enhanceProps(props)} />

export default React.memo(Stop);
