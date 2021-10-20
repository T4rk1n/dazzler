import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Dl = (props: Props) => <dl {...enhanceProps(props)} />

export default React.memo(Dl);
