import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Embed = (props: Props) => <embed {...enhanceProps(props)} />

export default React.memo(Embed);
