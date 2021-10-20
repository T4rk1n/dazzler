import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Track = (props: Props) => <track {...enhanceProps(props)} />

export default React.memo(Track);
