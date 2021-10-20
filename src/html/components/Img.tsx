import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Img = (props: Props) => <img {...enhanceProps(props)} />

export default React.memo(Img);
