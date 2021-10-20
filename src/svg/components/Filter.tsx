import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFilterElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Filter = (props: Props) => <filter {...enhanceProps(props)} />

export default React.memo(Filter);
