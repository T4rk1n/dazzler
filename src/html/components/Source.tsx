import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Source = (props: Props) => <source {...enhanceProps(props)} />

export default React.memo(Source);
