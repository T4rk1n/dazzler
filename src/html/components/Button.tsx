import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Button = (props: Props) => <button {...enhanceProps(props)} />

export default React.memo(Button);
