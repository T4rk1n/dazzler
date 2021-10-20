import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEMorphologyElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeMorphology = (props: Props) => <feMorphology {...enhanceProps(props)} />

export default React.memo(FeMorphology);
