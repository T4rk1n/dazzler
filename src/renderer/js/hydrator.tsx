import {map, omit, toPairs, type} from 'ramda';
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

function hydrateProp(
    value: any,
    updateAspects: WrapperUpdateAspectFunc,
    connect: ConnectFunc,
    disconnect: DisconnectFunc,
    onContext?: Function
) {
    if (type(value) === 'Array') {
        console.log(value);
        return value.map((e) => {
            if (isComponent(e)) {
                if (!e.aspects.key) {
                    e.aspects.key = e.identity;
                }
            }
            return hydrateProp(
                e,
                updateAspects,
                connect,
                disconnect,
                onContext
            );
        });
    } else if (isComponent(value)) {
        const newProps = hydrateProps(
            value.aspects,
            updateAspects,
            connect,
            disconnect,
            onContext
        );
        return hydrateComponent(
            value.name,
            value.package,
            value.identity,
            newProps,
            updateAspects,
            connect,
            disconnect,
            onContext
        );
    } else if (type(value) === 'Object') {
        return hydrateProps(
            value,
            updateAspects,
            connect,
            disconnect,
            onContext
        );
    }
    return value;
}

export function hydrateProps(
    props: AnyDict,
    updateAspects: WrapperUpdateAspectFunc,
    connect: ConnectFunc,
    disconnect: DisconnectFunc,
    onContext?: Function
) {
    return toPairs(props).reduce((acc, [aspect, value]) => {
        acc[aspect] = hydrateProp(
            value,
            updateAspects,
            connect,
            disconnect,
            onContext
        );
        return acc;
    }, {});
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
