import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Canvas = (props: Props) => <canvas {...enhanceProps(props)} />

export default React.memo(Canvas);
