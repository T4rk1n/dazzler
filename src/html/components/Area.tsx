import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Area = (props: Props) => <area {...enhanceProps(props)} />

export default React.memo(Area);
