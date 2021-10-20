import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Progress = (props: Props) => <progress {...enhanceProps(props)} />

export default React.memo(Progress);
