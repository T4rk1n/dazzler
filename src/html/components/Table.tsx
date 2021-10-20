import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Table = (props: Props) => <table {...enhanceProps(props)} />

export default React.memo(Table);
