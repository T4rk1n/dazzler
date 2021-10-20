import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Tbody = (props: Props) => <tbody {...enhanceProps(props)} />

export default React.memo(Tbody);
