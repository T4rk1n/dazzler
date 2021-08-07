type Dict<T> = {[key: string]: T};
type StringDict = {[key: string]: string};
type AnyDict = Dict<any>;
type UpdateAspectFunc = (aspects: AnyDict) => void;

export interface DazzlerProps {
    /**
     * Class name automatically added by dazzler api with a prefix for the
     *  component library.
     * ie: core component Container become ``dazzler-core-container``
     *
     * When added on the component, the class names will be concatenated.
     */
    class_name?: string;
    /**
     * Base identifier for the component, if not provided, a random hash
     * will be generated.
     */
    identity?: string;
    /**
     * Style object for the top level wrapper of the component.
     */
    style?: object;
    /**
     * Added to dazzler components props, allow changes of aspects and
     * trigger ties & bindings.
     */
    updateAspects?: UpdateAspectFunc;
}
