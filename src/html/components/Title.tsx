import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Title = (props: Props) => <title {...enhanceProps(props)} />

export default React.memo(Title);
