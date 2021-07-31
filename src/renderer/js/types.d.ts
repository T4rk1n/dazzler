import {AnyDict, UpdateAspectFunc} from 'commons/js/types';

type RenderOptions = {
    baseUrl: string;
    ping: boolean;
    ping_interval: number;
    retries: number;
};

type Requirement = {
    url: string;
    kind: string;
    meta: any;
};

type Package = {
    requirements: Requirement[];
};

type DisconnectFunc = (identity: string) => void;
type GetAspectFunc = (aspect: string) => any;
type MatchAspectFunc = (aspect: RegExp) => Array<Array<string | any>>;
type WrapperUpdateAspectFunc = (identity: string, aspects: AnyDict) => void;

type ConnectFunc = (
    identity: string,
    setAspects: UpdateAspectFunc,
    getAspect: GetAspectFunc,
    matchAspects: MatchAspectFunc,
    updateAspects: WrapperUpdateAspectFunc
) => void;

type WrapperProps = {
    identity: string;
    aspects: AnyDict;
    component_name: string;
    package_name: string;
    updateAspects: WrapperUpdateAspectFunc;
    connect: ConnectFunc;
    disconnect: DisconnectFunc;
    component: JSX.Element;
};

type WrapperState = {
    aspects: AnyDict;
    ready: boolean;
    initial: boolean;
};

type DryDazzlerComponent = {
    name: string;
    identity: string;
    package: string;
    aspects: AnyDict;
};

type BindType = {
    identity: string;
    aspect: string;
    regex: boolean;
};

type Binding = {
    trigger: BindType;
    states: BindType[];
    regex?: boolean;
    value?: any;
};

type EvolvedBindType = {
    identity: RegExp;
    aspect: RegExp;
};

type EvolvedBinding = {
    trigger: EvolvedBindType;
    states: BindType[];
    value?: any;
};

type BoundComponent = {
    matchAspects: MatchAspectFunc;
    getAspect: GetAspectFunc;
    updateAspects: UpdateAspectFunc;
    setAspects: UpdateAspectFunc;
};

type BoundComponents = {
    [key: string]: BoundComponent;
};

type UpdaterState = {
    layout?: DryDazzlerComponent;
    page: string;
    bindings: {[key: string]: Binding};
    rebindings: EvolvedBinding[];
    packages: Package[];
    requirements: Requirement[];
    ties: any;
    reload: boolean;
    reloading: boolean;
    needRefresh: boolean;
    ready: boolean;
};

type UpdaterProps = RenderOptions & {
    hotReload: () => void;
};

type TransformGetAspectFunc = (identity: string, aspect: string) => any;
type TransformFunc = (
    value: any,
    args?: any,
    getAspect?: TransformGetAspectFunc
) => any;

type XhrRequestOptions = {
    method?: string;
    headers?: AnyDict;
    payload?: string | Blob | ArrayBuffer | object | Array<any>;
    json?: boolean;
};
