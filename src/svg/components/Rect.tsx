import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGRectElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Rect = (props: Props) => <rect {...enhanceProps(props)} />

export default React.memo(Rect);
