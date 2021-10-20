import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Dialog = (props: Props) => <dialog {...enhanceProps(props)} />

export default React.memo(Dialog);
