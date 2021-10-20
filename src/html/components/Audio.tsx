import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Audio = (props: Props) => <audio {...enhanceProps(props)} />

export default React.memo(Audio);
