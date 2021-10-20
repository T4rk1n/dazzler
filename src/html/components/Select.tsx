import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Select = (props: Props) => <select {...enhanceProps(props)} />

export default React.memo(Select);
