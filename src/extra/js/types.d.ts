import {DazzlerProps} from '../../commons/js/types';
import PropTypes from 'prop-types';

type DrawerSide = 'top' | 'left' | 'right' | 'bottom';
type DrawerProps = {
    children?: JSX.Element;
    /**
     * DrawerSide to open the drawer from.
     */
    side?: DrawerSide;
    opened?: boolean;
} & DazzlerProps;

type CaretProps = {
    side: DrawerSide;
    opened?: boolean;
}

type NoticePermission = 'denied' | 'granted' | 'default' | 'unsupported';

type NoticeProps = {
    title: string;
    /**
     * A DOMString representing the body text of the notification, which will be displayed below the title.
     */
    body?: string;
    /**
     * Permission granted by the user (READONLY)
     */
    permission?: NoticePermission;
    /**
     * The notification's language, as specified using a DOMString representing a BCP 47 language tag.
     */
    lang?: string;
    /**
     * A USVString containing the URL of the image used to represent the notification when there is not enough space to display the notification itself.
     */
    badge?: string;
    /**
     * A DOMString representing an identifying tag for the notification.
     */
    tag?: string;
    /**
     * A USVString containing the URL of an icon to be displayed in the notification.
     */
    icon?: string;
    /**
     *  a USVString containing the URL of an image to be displayed in the notification.
     */
    image?: string;
    /**
     * A vibration pattern for the device's vibration hardware to emit when the notification fires.
     */
    vibrate?: number | number[];
    /**
     * Indicates that a notification should remain active until the user clicks or dismisses it, rather than closing automatically. The default value is false.
     */
    require_interaction?: boolean;
    /**
     * Set to true to display the notification.
     */
    displayed?: boolean;
    clicks?: number;
    clicks_timestamp?: number;
    /**
     * Number of times the notification was closed.
     */
    closes?: number;
    closes_timestamp?: number;
} & DazzlerProps;

type NoticeState = {
    lastMessage?: string;
    notification?: any;
}

type PagerProps = {
    /**
     * The total items in the set.
     */
    total_items: number;
    /**
     * The number of items a page contains.
     */
    items_per_page?: number;

    identity?: string;
    style?: object;
    class_name?: string;
    /**
     * Style for the page numbers.
     */
    page_style?: object;
    /**
     * CSS class for the page numbers.
     */
    page_class_name?: string;
    /**
     * The number of pages displayed by the pager.
     */
    pages_displayed?: number;
    /**
     * Read only, the currently displayed pages numbers.
     */
    pages?: number[];
    /**
     * The current selected page.
     */
    current_page?: number;
    /**
     * Set by total_items / items_per_page
     */
    total_pages?: number;

    /**
     * The starting index of the current page
     * Can be used to slice data eg: data[start_offset: end_offset]
     */
    start_offset?: number;
    /**
     * The end index of the current page.
     */
    end_offset?: number;
} & DazzlerProps;

type PagerState = {
    current_page?: number;
    start_offset?: number;
    end_offset?: number;
    total_pages?: number;
    pages?: number[];
}

type PagerPageProps = {
    style?: object;
    class_name?: string;
    on_change?: Function;
    text?: string;
    page: number;
}

type PopUpProps = {
    /**
     * Component/text to wrap with a popup on hover/click.
     */
    children: JSX.Element;
    /**
     * Content of the popup info.
     */
    content: JSX.Element;
    /**
     * Is the popup currently active.
     */
    active?: boolean;
    /**
     * Show popup on hover or click.
     */
    mode?: 'hover' | 'click';
    /**
     * Style for the popup.
     */
    content_style?: object;
    /**
     * Style for the wrapped children.
     */
    children_style?: object;
} & DazzlerProps;

type StickyProps = {
    children: JSX.Element;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
} & DazzlerProps;

type ToastProps = {
    /**
     * What to show in the toast.
     */
    message: JSX.Element;

    /**
     * Delay in milliseconds before the toast is automatically closed.
     */
    delay?: number;

    /**
     * Where the toast will be display.
     */
    position?:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'bottom'
        | 'bottom-left'
        | 'bottom-right'
        | 'left'
        | 'right'
        | 'center';
    /**
     * To display the toast for the delay.
     */
    opened?: boolean;
} & DazzlerProps;

type TreeViewItem = {
    identifier: string;
    label?: string;
    items?: TreeViewItem[];
};

type TreeViewProps = {
    /**
     * An array of items to render recursively.
     */
    items: string[] | object[] | TreeViewItem[];
    /**
     * Last clicked path identifier joined by dot.
     */
    selected?: string;
    /**
     * Identifiers that have sub items and are open.
     * READONLY.
     */
    expanded_items?: string[];
    /**
     * Icon to show when sub items are hidden.
     */
    nest_icon_collapsed?: string;
    /**
     * Icon to show when sub items are shown.
     */
    nest_icon_expanded?: string;
} & DazzlerProps;


type TreeViewItemProps = TreeViewItem & {
    onClick?: Function;
    level?: number;
    selected?: string;
    expanded_items?: string[];
    nest_icon_expanded?: string;
    nest_icon_collapsed?: string;
}
