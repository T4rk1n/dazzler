import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGPolylineElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Polyline = (props: Props) => <polyline {...enhanceProps(props)} />

export default React.memo(Polyline);
