import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGEllipseElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Ellipse = (props: Props) => <ellipse {...enhanceProps(props)} />

export default React.memo(Ellipse);
