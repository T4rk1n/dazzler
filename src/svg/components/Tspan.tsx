import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGTSpanElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Tspan = (props: Props) => <tspan {...enhanceProps(props)} />

export default React.memo(Tspan);
