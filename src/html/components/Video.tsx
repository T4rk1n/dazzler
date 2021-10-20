import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Video = (props: Props) => <video {...enhanceProps(props)} />

export default React.memo(Video);
