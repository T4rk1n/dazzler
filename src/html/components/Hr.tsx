import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Hr = (props: Props) => <hr {...enhanceProps(props)} />

export default React.memo(Hr);
