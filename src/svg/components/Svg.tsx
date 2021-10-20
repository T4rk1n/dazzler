import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGSVGElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Svg = (props: Props) => <svg {...enhanceProps(props)} />

export default React.memo(Svg);
