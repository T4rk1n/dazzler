from dazzler.components import core
from dazzler.system import Page, Target, transforms as t


page = Page(
    __name__,
    core.Container([
        core.Input(identity='text-input'),
        core.Input(type='number', value=15, identity='number-input-1'),
        core.Input(type='number', value=3, identity='number-input-2'),
        core.Store(data={}, identity='store'),
        core.Container(
            identity='text-output',
            style={'color': 'red', 'fontWeight': 'bold'}
        ),
        core.Container(identity='formatted-object-output'),
        core.Container(identity='add-output'),
        core.Container(identity='sub-output'),
        core.Container(identity='mult-output'),
        core.Container(identity='div-output'),
        core.Container(identity='mod-output'),
        core.Container(identity='store-output'),

        core.Store(data=[], identity='store-list'),
        core.Container(identity='store-list-output'),
        core.Container(identity='list-output'),

        core.Store(
            data={'a': 'b', 'b': 'a', 'c': 'c'},
            identity='store-object'
        ),
        core.Container(identity='store-object-output'),
        core.Container(identity='object-output'),

        core.Container([
            core.Container('List transforms'),
            core.Button('reset-list', identity='reset-list-btn'),
            core.Button('range', identity='range-btn'),
            core.Button('append', identity='append-btn'),
            core.Button('prepend', identity='prepend-btn'),
            core.Button('insert', identity='insert-btn'),
            core.Button('concat', identity='concat-btn'),
            core.Button('slice', identity='slice-btn'),
            core.Button('map', identity='map-btn'),
            core.Button('reduce', identity='reduce-btn'),
            core.Button('filter', identity='filter-btn'),
            core.Button('pluck', identity='pluck-btn'),
            core.Button('take', identity='take-btn'),
            core.Button('length', identity='length-btn'),
            core.Button('includes', identity='includes-btn'),
            core.Button('find', identity='find-btn'),
            core.Button('join', identity='join-btn'),
            core.Button('reverse', identity='reverse-btn'),
            core.Button('unique', identity='unique-btn'),
            core.Button('zip', identity='zip-btn'),
            core.Button('sort', identity='sort-btn')
        ]),

        core.Container([
            core.Container('Object transforms'),
            core.Button('Pick', identity='pick-btn'),
            core.Button('Get', identity='get-btn'),
            core.Button('Set', identity='set-btn'),
            core.Button('Put', identity='put-btn'),
            core.Button('Merge', identity='merge-btn'),
        ]),
    ]),
    packages=['dazzler_core']
)


# Text transforms
page.tie('value@text-input', 'children@text-output').transform(
    t.If(t.Equals('foo'), t.Add(' bar'))
)

page.tie('value@text-input', 'style@text-output').transform(
    t.If(
        t.Equals('foo'),
        then=t.AspectValue('style@text-output').t(
            t.Merge({'color': 'green'})
        ),
        otherwise=t.AspectValue('style@text-output').t(
            t.Merge({'color': 'blue'})
        )
    )
)

page.tie('value@text-input', 'data@store').transform(t.ToUpper()).transform(
    t.Put('text-upper', Target('data@store'))
)
page.tie('value@text-input', 'data@store').transform(t.ToLower()).transform(
    t.Put('text-lower', Target('data@store'))
)
page.tie('value@text-input', 'data@store').transform(t.Split(' ')).transform(
    t.Put('text-split', Target('data@store'))
)

page.tie('data@store', 'children@formatted-object-output').transform(
    t.Format('${number-1} + ${number-2} =')
)

# Number transforms

page.tie('value@number-input-1', 'children@add-output').transform(
    t.Add(Target('value@number-input-2'))
)
page.tie('value@number-input-2', 'children@add-output').transform(
    t.Add(Target('value@number-input-1'))
)
page.tie('value@number-input-1', 'children@sub-output').transform(
    t.Sub(Target('value@number-input-2'))
)
page.tie('value@number-input-2', 'children@sub-output').transform(
    t.AspectValue('value@number-input-1').t(
        t.Sub(Target('value@number-input-2')))
)

page.tie('value@number-input-1', 'children@mult-output').transform(
    t.Multiply(Target('value@number-input-2'))
)
page.tie('value@number-input-2', 'children@mult-output').transform(
    t.AspectValue('value@number-input-1').t(
        t.Multiply(Target('value@number-input-2')))
)

page.tie('value@number-input-1', 'children@div-output').transform(
    t.Divide(Target('value@number-input-2'))
)
page.tie('value@number-input-2', 'children@div-output').transform(
    t.AspectValue('value@number-input-1').t(
        t.Divide(Target('value@number-input-2')))
).t(t.ToPrecision(2))

page.tie('value@number-input-1', 'children@mod-output').transform(
    t.Modulus(Target('value@number-input-2'))
)
page.tie('value@number-input-2', 'children@mod-output').transform(
    t.AspectValue('value@number-input-1').t(
        t.Modulus(Target('value@number-input-2')))
)

# List transforms

page.tie('clicks@reset-list-btn', 'data@store-list').transform(t.RawValue([]))
page.tie('clicks@range-btn', 'data@store-list').transform(t.Range(1, 10))
page.tie('clicks@append-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Append('appended'))
)
page.tie('clicks@prepend-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Prepend('prepended'))
)
page.tie('clicks@insert-btn', 'data@store-list').transform(
    t.Insert(Target('data@store-list'))
)
page.tie('clicks@concat-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Concat([33, 66, 99]))
)
page.tie('clicks@slice-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Slice(4, 8))
)
page.tie('clicks@map-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Map(t.Format('value: ${value}')))
)

page.tie('clicks@reduce-btn', 'children@list-output').transform(
    t.AspectValue('data@store-list').t(t.Reduce(t.Join(' ')))
)
page.tie('clicks@filter-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Filter(t.Greater(5)))
)
page.tie('clicks@pluck-btn', 'data@store-list').transform(
    t.RawValue([{'a': 'a', 'b': 'b'}, {'a': 'b'}]).t(t.Pluck('a'))
)
page.tie('clicks@take-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Take(2))
)
page.tie('clicks@length-btn', 'children@list-output').transform(
    t.AspectValue('data@store-list').t(t.Length())
)
page.tie('clicks@includes-btn', 'children@list-output').transform(
    t.AspectValue('data@store-list').t(
        t.Includes(Target('value@number-input-2')).t(
            t.Format('Include: ${value}')))
)

page.tie('clicks@find-btn', 'children@list-output').transform(
    t.RawValue([{'a': 'a', 'b': 'b'}, {'a': 'b', 'b': 'a'}]).t(
        t.Find(t.Get('a').t(t.Equals('b')))).t(t.ToJson())
)
page.tie('clicks@join-btn', 'children@list-output').transform(
    t.AspectValue('data@store-list').t(t.Join('-'))
)
page.tie('clicks@reverse-btn', 'data@store-list').transform(
    t.AspectValue('data@store-list').t(t.Reverse())
)
page.tie('clicks@unique-btn', 'data@store-list').transform(
    t.RawValue([1, 1, 2, 2, 2, 3, 3, 4, 4, 4]).t(t.Unique())
)
page.tie('clicks@zip-btn', 'data@store-list').transform(
    t.RawValue(['a', 'b', 'c']).t(t.Zip([1, 2, 3]))
)

# Sort & Reduce are messy for now.
# page.tie('clicks@sort-btn', 'data@store-list').transform(
#     t.AspectValue('data@store-list').t(t.Sort(t.Reduce(t.Add())))
# )

# Objects transforms

page.tie('clicks@pick-btn', 'children@object-output').transform(
    t.AspectValue('data@store-object').t(t.Pick(['a', 'b']))
).t(t.ToJson())

page.tie('clicks@get-btn', 'children@object-output').transform(
    t.AspectValue('data@store-object').t(t.Get('a'))
)

page.tie('clicks@set-btn', 'data@store-object').transform(
    t.AspectValue('data@store-object').t(t.Set('a', 'e'))
)

page.tie('clicks@put-btn', 'data@store-object').transform(
    t.RawValue('o').t(t.Put('a', Target('data@store-object')))
)
page.tie('clicks@merge-btn', 'data@store-object').transform(
    t.AspectValue('data@store-object').t(t.Merge({'e': 'o'}))
)

# Store stuff

page.tie('data@store', 'children@store-output').transform(t.ToJson())
page.tie('data@store-list', 'children@store-list-output').t(t.ToJson())
page.tie('data@store-object', 'children@store-object-output').t(t.ToJson())

page.tie('value@number-input-1', 'data@store').transform(
    t.Put('number-1', Target('data@store'))
)
page.tie('value@number-input-2', 'data@store').transform(
    t.Put('number-2', Target('data@store'))
)
