import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Option = (props: Props) => <option {...enhanceProps(props)} />

export default React.memo(Option);
