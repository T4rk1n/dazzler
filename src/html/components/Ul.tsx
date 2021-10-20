import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Ul = (props: Props) => <ul {...enhanceProps(props)} />

export default React.memo(Ul);
