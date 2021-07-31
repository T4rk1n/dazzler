import React from 'react';
import PropTypes from 'prop-types';
import {concat, join} from 'ramda';
import {collectTruePropKeys} from 'commons';

/**
 * An image.
 *
 * :CSS:
 *
 *     - ``dazzler-core-image``
 *     - ``bordered``
 *     - ``padded``
 *     - ``rounded``
 *     - ``centered``
 */
export default class Image extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !(this.props.clicks < nextProps.clicks);
    }

    render() {
        const {
            class_name,
            style,
            identity,
            alt,
            src,
            caption,
            height,
            width,
            cross_origin,
            decoding,
            caption_class_name,
            caption_style,
            link,
            link_class_name,
            link_style,
            figure_class_name,
            figure_style,
        } = this.props;

        const css = collectTruePropKeys(this.props, [
            'rounded',
            'bordered',
            'circle',
            'flexible',
            'centered',
            'padded',
        ]);

        let content = (
            <img
                alt={alt}
                src={src}
                height={height}
                width={width}
                crossOrigin={cross_origin}
                decoding={decoding}
                className={join(' ', concat(css, [class_name]))}
                style={style}
                id={identity}
                onClick={() =>
                    this.props.updateAspects({
                        clicks: this.props.clicks + 1,
                    })
                }
            />
        );

        if (link) {
            const linkCss = ['dazzler-core-image-link'];
            if (link_class_name) {
                linkCss.push(link_class_name);
            }
            content = (
                <a
                    href={link}
                    style={link_style}
                    className={join(' ', concat(css, linkCss))}
                >
                    {content}
                </a>
            );
        }
        if (caption) {
            const figCss = ['dazzler-core-figure'];
            const capCss = ['dazzler-core-caption'];
            if (figure_class_name) {
                figCss.push(figure_class_name);
            }
            if (caption_class_name) {
                capCss.push(caption_class_name);
            }
            content = (
                <figure
                    style={figure_style}
                    className={join(' ', concat(css, figCss))}
                >
                    {content}
                    {caption && (
                        <figcaption
                            className={join(' ', concat(css, capCss))}
                            style={caption_style}
                        >
                            {caption}
                        </figcaption>
                    )}
                </figure>
            );
        }

        return content;
    }
}

Image.defaultProps = {
    clicks: 0,
};

Image.propTypes = {
    /**
     * The source url of the image.
     */
    src: PropTypes.string.isRequired,
    /**
     * Alt img attribute to show when the browser cannot display the image.
     */
    alt: PropTypes.string.isRequired,

    /**
     * Height in pixel
     */
    height: PropTypes.number,
    /**
     * Width in pixel
     */
    width: PropTypes.number,

    /**
     * Link to another page when the image is clicked.
     */
    link: PropTypes.string,

    /**
     * Text to include beneath the image.
     */
    caption: PropTypes.node,

    /**
     * Fetch the image with CORS.
     */
    cross_origin: PropTypes.oneOf(['anonymous', 'use-credentials']),

    /**
     * Decoding hint for the browser
     */
    decoding: PropTypes.oneOf(['sync', 'async', 'auto']),

    /**
     * Preload the image before mount.
     */
    preload: PropTypes.bool,

    /**
     * Times the image was clicked on.
     */
    clicks: PropTypes.number,

    /**
     * CSS class to give to root element, (Scoped: dazzler-core-image)
     */
    class_name: PropTypes.string,

    /**
     * Style object of the root element.
     */
    style: PropTypes.object,

    /**
     * Add bordered style class
     */
    bordered: PropTypes.bool,
    /**
     * Add rounded style class
     */
    rounded: PropTypes.bool,

    /**
     * Add centered style class for the image to
     * appear in the horizontal middle
     */
    centered: PropTypes.bool,

    /**
     * Take up the whole size of the parent container.
     */
    flexible: PropTypes.bool,

    /**
     * Image is a circle
     */
    circle: PropTypes.bool,

    /**
     * Add a little padding around the image.
     */
    padded: PropTypes.bool,

    /**
     * Style to give to the caption of the image.
     */
    caption_style: PropTypes.object,

    /**
     * CSS class to give to the caption of the image.
     */
    caption_class_name: PropTypes.string,

    /**
     * CSS class to give to figure if caption is provided.
     */
    figure_class_name: PropTypes.string,

    /**
     * Style object to give to figure if caption is provided.
     */
    figure_style: PropTypes.object,

    /**
     * CSS class to give to the link element.
     */
    link_class_name: PropTypes.string,

    /**
     * Style object to give to the link.
     */
    link_style: PropTypes.object,

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
