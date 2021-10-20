import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGTextElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Text = (props: Props) => <text {...enhanceProps(props)} />

export default React.memo(Text);
