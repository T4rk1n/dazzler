import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Br = (props: Props) => <br {...enhanceProps(props)} />

export default React.memo(Br);
