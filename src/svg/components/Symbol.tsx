import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGSymbolElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Symbol = (props: Props) => <symbol {...enhanceProps(props)} />

export default React.memo(Symbol);
