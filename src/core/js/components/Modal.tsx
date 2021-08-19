import React, {useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

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
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

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
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/modal.py
 *     :lines: 5-25
 */
const Modal = (props: ModalProps) => {
    const {
        identity,
        class_name,
        style,
        active,
        body,
        header,
        footer,
        close_button,
        updateAspects,
        ...rest
    } = props;

    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    return (
        <div className={css} style={styling} id={identity}>
            <div
                className={`modal-overlay${active ? ' modal-active' : ''}`}
                onClick={(e) => {
                    updateAspects({active: false});
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
                                    updateAspects({
                                        active: false,
                                    })
                                }
                            >
                                ❌
                            </div>
                        )}
                    </div>
                    <div className="modal-body">{body}</div>
                    {footer && <div className="modal-footer">{footer}</div>}
                </div>
            </div>
        </div>
    );
};

Modal.defaultProps = {
    close_button: true,
};

export default Modal;
