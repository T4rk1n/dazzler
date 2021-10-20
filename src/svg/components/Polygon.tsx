import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGPolygonElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Polygon = (props: Props) => <polygon {...enhanceProps(props)} />

export default React.memo(Polygon);
