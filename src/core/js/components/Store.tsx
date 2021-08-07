import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type StoreProps = {
    /**
     * Stored data.
     */
    data?: any;
} & DazzlerProps;

/**
 * Store data in the browser memory. Data last until the page is refreshed.
 */
export default class Store extends React.Component<StoreProps> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return null;
    }
}
