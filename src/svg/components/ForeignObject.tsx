import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGForeignObjectElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const ForeignObject = (props: Props) => <foreignObject {...enhanceProps(props)} />

export default React.memo(ForeignObject);
