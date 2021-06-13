import {map, omit, type} from 'ramda';
import React from 'react';
import Wrapper from './components/Wrapper';

export function isComponent(c) {
    return (
        type(c) === 'Object' &&
        (c.hasOwnProperty('package') &&
            c.hasOwnProperty('aspects') &&
            c.hasOwnProperty('name') &&
            c.hasOwnProperty('identity'))
    );
}

export function hydrateProps(
    props,
    updateAspects,
    connect,
    disconnect,
    onContext
) {
    const replace = {};
    Object.entries(props).forEach(([k, v]) => {
        if (type(v) === 'Array') {
            replace[k] = v.map(c => {
                if (!isComponent(c)) {
                    // Mixing components and primitives
                    if (type(c) === 'Object') {
                        // Not a component but maybe it contains some ?
                        return hydrateProps(
                            c,
                            updateAspects,
                            connect,
                            disconnect,
                            onContext
                        );
                    }
                    return c;
                }
                const newProps = hydrateProps(
                    c.aspects,
                    updateAspects,
                    connect,
                    disconnect,
                    onContext
                );
                if (!newProps.key) {
                    newProps.key = c.identity;
                }
                return hydrateComponent(
                    c.name,
                    c.package,
                    c.identity,
                    newProps,
                    updateAspects,
                    connect,
                    disconnect,
                    onContext
                );
            });
        } else if (isComponent(v)) {
            const newProps = hydrateProps(
                v.aspects,
                updateAspects,
                connect,
                disconnect,
                onContext
            );
            replace[k] = hydrateComponent(
                v.name,
                v.package,
                v.identity,
                newProps,
                updateAspects,
                connect,
                disconnect,
                onContext
            );
        } else if (type(v) === 'Object') {
            replace[k] = hydrateProps(
                v,
                updateAspects,
                connect,
                disconnect,
                onContext
            );
        }
    });
    return {...props, ...replace};
}

export function hydrateComponent(
    name,
    package_name,
    identity,
    props,
    updateAspects,
    connect,
    disconnect,
    onContext
) {
    const pack = window[package_name];
    if (!pack) {
        throw new Error(`Invalid package name: ${package_name}`);
    }
    const component = pack[name];
    if (!component) {
        throw new Error(`Invalid component name: ${package_name}.${name}`);
    }
    const element = React.createElement(component, props);

    const wrapper = ({children}) => (
        <Wrapper
            identity={identity}
            updateAspects={updateAspects}
            component={element}
            connect={connect}
            package_name={package_name}
            component_name={name}
            aspects={{children, ...props}}
            disconnect={disconnect}
            key={`wrapper-${identity}`}
        />
    );

    if (component.isContext) {
        onContext(wrapper);
        return null;
    } else {
        return wrapper({});
    }
}

export function prepareProp(prop) {
    if (React.isValidElement(prop)) {
        return {
            identity: prop.props.identity,
            aspects: map(
                prepareProp,
                omit(
                    [
                        'identity',
                        'updateAspects',
                        '_name',
                        '_package',
                        'aspects',
                        'key',
                    ],
                    prop.props.aspects
                )
            ),
            name: prop.props.component_name,
            package: prop.props.package_name,
        };
    }
    if (type(prop) === 'Array') {
        return prop.map(prepareProp);
    }
    if (type(prop) === 'Object') {
        return map(prepareProp, prop);
    }
    return prop;
}
