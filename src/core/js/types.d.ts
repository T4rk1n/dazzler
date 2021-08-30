import {AnyDict} from '../../commons/js/types';

type LabelValue<T> = {
    label: JSX.Element;
    value: T;
};

type LabelValueAny = LabelValue<any>;

type LabelValueAnyList = LabelValueAny[];

type StylableLabelValue = LabelValueAny & {
    title?: string;
    class_name?: string;
    style?: AnyDict;
};

type StylableInputLabelValue = StylableLabelValue & {
    label_class_name?: string;
    label_style?: AnyDict;
    input_class_name?: string;
    input_style?: AnyDict;
};

type OnOff = 'on' | 'off';
