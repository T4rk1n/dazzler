import {
    append,
    ascend,
    concat,
    descend,
    insert,
    isNil,
    pick,
    prepend,
    prop,
    propEq,
    sort,
} from 'ramda';
import {UpdateAspectFunc} from '../../commons/js/types';

type DeleteData = {
    key: string;
    value: any;
};

type InsertData = {
    index: number;
    value: any;
};

type SortData = {
    /**
     * Sort the data by key.
     */
    key: string;
    /**
     * Sort direction of the data.
     */
    sort_data_direction?: 'asc' | 'desc';
};

export type DataEffectsProps = Partial<{
    /**
     * Prepend data to the start of the list.
     */
    prepend_data: any;
    /**
     * Append data to the end of the list.
     */
    append_data: any;
    /**
     * Concat a list of new data with the previous data.
     */
    concat_data: any;
    /**
     * Delete data by key and value.
     */
    delete_data: DeleteData;
    /**
     * Insert data at the index.
     */
    insert_data: InsertData;
    /**
     * Sort the data.
     */
    sort_data: SortData;
}>;

export const pickDataEffectsProps = pick([
    'prepend_data',
    'append_data',
    'concat_data',
    'delete_data',
    'insert_data',
    'sort_data',
]);

export default function dataEffectsFactory(updateAspects: UpdateAspectFunc) {
    const effectFactory =
        (key: string, operation) => (value, oldData) => () => {
            if (!isNil(value)) {
                updateAspects({
                    data: operation(value, oldData),
                    [key]: null,
                });
            }
        };

    return {
        prepend_data: effectFactory('prepend_data', prepend),
        append_data: effectFactory('append_data', append),
        concat_data: effectFactory('concat_data', (value, oldData) =>
            concat(oldData, value)
        ),
        delete_data: effectFactory(
            'delete_data',
            (value: DeleteData, oldData) =>
                oldData.filter((obj) => !propEq(value.key, value.value, obj))
        ),
        insert_data: effectFactory(
            'insert_data',
            (value: InsertData, oldData) =>
                insert(value.index, value.value, oldData)
        ),
        sort_data: effectFactory('sort_data', (value: SortData, oldData) =>
            sort(
                value.sort_data_direction === 'desc'
                    ? descend(prop(value.key))
                    : ascend(prop(value.key)),
                oldData
            )
        ),
    };
}
