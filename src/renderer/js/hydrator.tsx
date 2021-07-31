import {map, omit, type} from 'ramda';
import React from 'react';
import Wrapper from './components/Wrapper';
import {AnyDict} from 'commons/js/types';
import {
    ConnectFunc,
    DisconnectFunc,
    WrapperProps,
    WrapperUpdateAspectFunc,
} from './types';

export function isComponent(c: any): boolean {
    return (
        type(c) === 'Object' &&
        c.hasOwnProperty('package') &&
        c.hasOwnProperty('aspects') &&
        c.hasOwnProperty('name') &&
        c.hasOwnProperty('identity')
    );
}

export function hydrateProps(
    props: AnyDict,
    updateAspects: WrapperUpdateAspectFunc,
    connect: ConnectFunc,
    disconnect: DisconnectFunc,
    onContext?: Function
) {
    const replace = {};
    Object.entries(props).forEach(([k, v]) => {
        if (type(v) === 'Array') {
            replace[k] = v.map((c) => {
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
                const newProps: {[key: string]: any} = hydrateProps(
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
    name: string,
    package_name: string,
    identity: string,
    props: AnyDict,
    updateAspects: WrapperUpdateAspectFunc,
    connect: ConnectFunc,
    disconnect: DisconnectFunc,
    onContext: Function
) {
    const pack = window[package_name];
    if (!pack) {
        throw new Error(`Invalid package name: ${package_name}`);
    }
    const component = pack[name];
    if (!component) {
        throw new Error(`Invalid component name: ${package_name}.${name}`);
    }
    // @ts-ignore
    const element = React.createElement(component, props);

    /* eslint-disable react/prop-types */
    const wrapper = ({children}: {children?: any}) => (
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
    }
    return wrapper({});
}

export function prepareProp(prop: any) {
    if (React.isValidElement(prop)) {
        // @ts-ignore
        const props: WrapperProps = prop.props;
        return {
            identity: props.identity,
            // @ts-ignore
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
                    props.aspects
                )
            ),
            name: props.component_name,
            package: props.package_name,
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
