import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Fieldset = (props: Props) => <fieldset {...enhanceProps(props)} />

export default React.memo(Fieldset);
