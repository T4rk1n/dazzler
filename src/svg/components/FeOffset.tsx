import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEOffsetElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeOffset = (props: Props) => <feOffset {...enhanceProps(props)} />

export default React.memo(FeOffset);
