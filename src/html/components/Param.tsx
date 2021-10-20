import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Param = (props: Props) => <param {...enhanceProps(props)} />

export default React.memo(Param);
