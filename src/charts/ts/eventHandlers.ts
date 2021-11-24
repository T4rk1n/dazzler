import {UpdateAspectFunc} from '../../commons/js/types';
import {pick} from 'ramda';

export type ChartEventHandlerProps = Partial<{
    handle_clicks: boolean;
    clicks: number;
    click_event: any;
    handle_hover: boolean;
    hovered: boolean;
    hover_event: any;
}>;

export const pickEventHandlerProps = pick([
    'handle_clicks',
    'clicks',
    'click_event',
    'handle_hover',
    'hovered',
    'hover_event',
]);

export function chartEventHandlerFactory(
    updateAspects: UpdateAspectFunc,
    eventHandlerProps: ChartEventHandlerProps
) {
    const props: any = {};
    if (eventHandlerProps.handle_clicks) {
        props.onClick = (click_event) =>
            updateAspects({
                click_event,
                clicks: (eventHandlerProps.clicks || 0) + 1,
            });
    }
    if (eventHandlerProps.handle_hover) {
        props.onMouseEnter = () => updateAspects({hovered: true});
        props.onMouseLeave = () => updateAspects({hovered: false});
        props.onMouseMove = (hover_event) => updateAspects({hover_event});
    }
    return props;
}
