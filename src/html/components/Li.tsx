import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Li = (props: Props) => <li {...enhanceProps(props)} />

export default React.memo(Li);
