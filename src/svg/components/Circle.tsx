import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGCircleElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Circle = (props: Props) => <circle {...enhanceProps(props)} />

export default React.memo(Circle);
