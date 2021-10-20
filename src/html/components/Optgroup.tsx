import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Optgroup = (props: Props) => <optgroup {...enhanceProps(props)} />

export default React.memo(Optgroup);
