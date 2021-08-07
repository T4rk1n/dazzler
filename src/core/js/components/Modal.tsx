import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

type ModalProps = {
    /**
     * Main content of the modal. (css: modal-body)
     */
    body: JSX.Element;

    /**
     * Appear before the body. (css: modal-header)
     */
    header?: JSX.Element;

    /**
     * Appear after the body. (css: modal-footer)
     */
    footer?: JSX.Element;

    /**
     * Activate the modal.
     */
    active?: boolean;

    /**
     * Include a close button in the top right corner of the header.
     */
    close_button?: boolean;
} & DazzlerProps;

/**
 * A modal overlay the page with a darkened background.
 *
 * :CSS:
 *
 *     - ``dazzler-core-modal``
 *     - ``modal-overlay``
 *     - ``modal-active``
 *     - ``modal-content``
 *     - ``modal-header``
 *     - ``modal-closer``
 *     - ``modal-body``
 *     - ``modal-footer``
 */
export default class Modal extends React.Component<ModalProps> {
    render() {
        const {
            identity,
            class_name,
            style,
            active,
            body,
            header,
            footer,
            close_button,
        } = this.props;
        return (
            <div className={class_name} style={style} id={identity}>
                <div
                    className={`modal-overlay${active ? ' modal-active' : ''}`}
                    onClick={(e) => {
                        this.props.updateAspects({active: false});
                        e.stopPropagation();
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>{header}</div>
                            {close_button && (
                                <div
                                    className="modal-closer"
                                    onClick={() =>
                                        this.props.updateAspects({
                                            active: false,
                                        })
                                    }
                                >
                                    X
                                </div>
                            )}
                        </div>
                        <div className="modal-body">{body}</div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            </div>
        );
    }
    static defaultProps = {
        close_button: true,
    };
}
