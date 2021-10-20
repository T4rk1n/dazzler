import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Ins = (props: Props) => <ins {...enhanceProps(props)} />

export default React.memo(Ins);
