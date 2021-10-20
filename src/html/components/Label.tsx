import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Label = (props: Props) => <label {...enhanceProps(props)} />

export default React.memo(Label);
