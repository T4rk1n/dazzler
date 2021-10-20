import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGRadialGradientElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const RadialGradient = (props: Props) => <radialGradient {...enhanceProps(props)} />

export default React.memo(RadialGradient);
