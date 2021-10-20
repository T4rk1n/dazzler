import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGUseElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Use = (props: Props) => <use {...enhanceProps(props)} />

export default React.memo(Use);
