import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Form = (props: Props) => <form {...enhanceProps(props)} />

export default React.memo(Form);
