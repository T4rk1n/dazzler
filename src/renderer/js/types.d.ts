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
    key: string;
};

type Package = {
    requirements: Requirement[];
};

type DisconnectFunc = (identity: string) => void;
type GetAspectFunc = (aspect: string) => any;
type MatchAspectFunc = (aspect: RegExp) => Array<Array<string | any>>;
type WrapperUpdateAspectFunc = (
    identity: string,
    aspects: AnyDict,
    initial?: boolean
) => Promise<number>;

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
    error?: any;
};

type DryDazzlerComponent = {
    name: string;
    identity: string;
    package: string;
    aspects: AnyDict;
};

type Aspect = {
    identity: string;
    aspect: string;
};

type RegAspect = {
    identity: string | RegExp;
    aspect: string | RegExp;
};

type BindType = Aspect & {
    regex: boolean;
};

type Trigger = BindType & {
    once: boolean;
    skip_initial: boolean;
};

type Binding = {
    trigger: Trigger;
    states: BindType[];
    regex?: boolean;
    value?: any;
    call?: boolean;
    key: string;
};

type EvolvedBindType = Trigger & {
    identity: RegExp;
    aspect: RegExp;
};

type EvolvedBinding = Binding & {
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

type Transform = {
    transform: string;
    args: AnyDict;
    next: Transform[];
};

type Tie = Binding & {
    transforms: Transform[];
    targets: Aspect[];
};

type EvolvedTie = Tie & {
    trigger: EvolvedBindType;
};

type Ties = Tie | EvolvedTie;

type UpdaterState = {
    layout?: DryDazzlerComponent;
    page: string;
    bindings: {[key: string]: Binding};
    rebindings: EvolvedBinding[];
    packages: {[k: string]: Package};
    requirements: Requirement[];
    ties: Ties[];
    reload: boolean;
    reloading: boolean;
    needRefresh: boolean;
    ready: boolean;
};

type UpdaterProps = RenderOptions & {
    hotReload: () => void;
};

type TransformGetAspectFunc = <T>(identity: string, aspect: string) => T;
type TransformFunc = (
    value: any,
    args: any,
    getAspect: TransformGetAspectFunc
) => any;

type XhrRequestOptions = {
    method?: string;
    headers?: AnyDict;
    payload?: string | Blob | ArrayBuffer | object | Array<any>;
    json?: boolean;
};

type ApiFunc = <T>(path: string, options?: XhrRequestOptions) => Promise<T>;

type PageApiResponse = {
    page: string;
    layout: any;
    bindings: Binding[];
    packages: Record<string, Package>;
    requirements: Requirement[];
    ties: Tie[];
    reload?: boolean;
};

type CallOutput = {
    output: {[k: string]: AnyDict};
};
