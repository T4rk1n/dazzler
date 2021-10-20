import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Textarea = (props: Props) => <textarea {...enhanceProps(props)} />

export default React.memo(Textarea);
