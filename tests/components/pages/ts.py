from dazzler.system import Page
from dazzler.components import core
from tests.components import ts_components as tsc

page = Page(
    __name__,
    core.Container([
        tsc.TypedComponent(
            'override',
            children=core.Container('foobar'),
            num=2,
            text='foobar',
            boo=True,
            arr=[1, 2, 'mixed'],
            arr_str=['foo', 'bar'],
            arr_num=[7, 8, 9],
            arr_obj_lit=[{'name': 'foo'}],
            obj={'anything': 'possible'},
            enumeration='foo',
            union=7,
            style={'border': '1px solid rgb(0,0,255)'},
            class_name='other'
        ),
        tsc.TypedClassComponent('class based', children='clazz')
    ])
)
