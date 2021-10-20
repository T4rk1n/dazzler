import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Menuitem = (props: Props) => <menuitem {...enhanceProps(props)} />

export default React.memo(Menuitem);
