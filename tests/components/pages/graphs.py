from dazzler.system import Page, BindingContext, transforms as t
from dazzler.components import core, charts

data = [
    {
        "y": i ^ 2,
        'z': i ^ 3,
        'x': i * 20,
        'name': f'named{i}',
        'u': f'under{i}',
    } for i in range(25)
]

margin = {
    'top': 10,
    'bottom': 10,
    'left': 10,
    'right': 10,
}

colors = [
    '#44bb33',
    '#003399',
    '#7d21e9',
    '#a333aa',
    '#b21199'
]

radar_data = [
    {'type': 'hockey', 'a': 100, 'b': 90, 'fill': colors[0]},
    {'type': 'baseball', 'a': 90, 'b': 60, 'fill': colors[1]},
    {'type': 'basketball', 'a': 75, 'b': 30, 'fill': colors[2]},
    {'type': 'football', 'a': 25, 'b': 100, 'fill': colors[3]},
    {'type': 'golf', 'a': 50, 'b': 10, 'fill': colors[4]},
]

treemap_data = [
  {
    "name": "axis",
    "children": [
      {
        "name": "Axis",
        "size": 24593
      },
      {
        "name": "Axes",
        "size": 1302
      },
      {
        "name": "AxisGridLine",
        "size": 652
      },
      {
        "name": "AxisLabel",
        "size": 636
      },
      {
        "name": "CartesianAxes",
        "size": 6703
      }
    ]
  },
  {
    "name": "controls",
    "children": [
      {
        "name": "TooltipControl",
        "size": 8435
      },
      {
        "name": "SelectionControl",
        "size": 7862
      },
      {
        "name": "PanZoomControl",
        "size": 5222
      },
      {
        "name": "HoverControl",
        "size": 4896
      },
      {
        "name": "ControlList",
        "size": 4665
      },
      {
        "name": "ClickControl",
        "size": 3824
      },
      {
        "name": "ExpandControl",
        "size": 2832
      },
      {
        "name": "DragControl",
        "size": 2649
      },
      {
        "name": "AnchorControl",
        "size": 2138
      },
      {
        "name": "Control",
        "size": 1353
      },
      {
        "name": "IControl",
        "size": 763
      }
    ]
  },
  {
    "name": "data",
    "children": [
      {
        "name": "Data",
        "size": 20544
      },
      {
        "name": "NodeSprite",
        "size": 19382
      },
      {
        "name": "DataList",
        "size": 19788
      },
      {
        "name": "DataSprite",
        "size": 10349
      },
      {
        "name": "EdgeSprite",
        "size": 3301
      },
      {
        "name": "render",
        "children": [
          {
            "name": "EdgeRenderer",
            "size": 5569
          },
          {
            "name": "ShapeRenderer",
            "size": 2247
          },
          {
            "name": "ArrowType",
            "size": 698
          },
          {
            "name": "IRenderer",
            "size": 353
          }
        ]
      },
      {
        "name": "ScaleBinding",
        "size": 11275
      },
      {
        "name": "TreeBuilder",
        "size": 9930
      },
      {
        "name": "Tree",
        "size": 7147
      }
    ]
  },
  {
    "name": "events",
    "children": [
      {
        "name": "DataEvent",
        "size": 7313
      },
      {
        "name": "SelectionEvent",
        "size": 6880
      },
      {
        "name": "TooltipEvent",
        "size": 3701
      },
      {
        "name": "VisualizationEvent",
        "size": 2117
      }
    ]
  },
  {
    "name": "legend",
    "children": [
      {
        "name": "Legend",
        "size": 20859
      },
      {
        "name": "LegendRange",
        "size": 10530
      },
      {
        "name": "LegendItem",
        "size": 4614
      }
    ]
  },
  {
    "name": "operator",
    "children": [
      {
        "name": "distortion",
        "children": [
          {
            "name": "Distortion",
            "size": 6314
          },
          {
            "name": "BifocalDistortion",
            "size": 4461
          },
          {
            "name": "FisheyeDistortion",
            "size": 3444
          }
        ]
      },
      {
        "name": "encoder",
        "children": [
          {
            "name": "PropertyEncoder",
            "size": 4138
          },
          {
            "name": "Encoder",
            "size": 4060
          },
          {
            "name": "ColorEncoder",
            "size": 3179
          },
          {
            "name": "SizeEncoder",
            "size": 1830
          },
          {
            "name": "ShapeEncoder",
            "size": 1690
          }
        ]
      },
      {
        "name": "filter",
        "children": [
          {
            "name": "FisheyeTreeFilter",
            "size": 5219
          },
          {
            "name": "VisibilityFilter",
            "size": 3509
          },
          {
            "name": "GraphDistanceFilter",
            "size": 3165
          }
        ]
      },
      {
        "name": "IOperator",
        "size": 1286
      },
      {
        "name": "label",
        "children": [
          {
            "name": "Labeler",
            "size": 9956
          },
          {
            "name": "RadialLabeler",
            "size": 3899
          },
          {
            "name": "StackedAreaLabeler",
            "size": 3202
          }
        ]
      },
      {
        "name": "layout",
        "children": [
          {
            "name": "RadialTreeLayout",
            "size": 12348
          },
          {
            "name": "NodeLinkTreeLayout",
            "size": 12870
          },
          {
            "name": "CirclePackingLayout",
            "size": 12003
          },
          {
            "name": "CircleLayout",
            "size": 9317
          },
          {
            "name": "TreeMapLayout",
            "size": 9191
          },
          {
            "name": "StackedAreaLayout",
            "size": 9121
          },
          {
            "name": "Layout",
            "size": 7881
          },
          {
            "name": "AxisLayout",
            "size": 6725
          },
          {
            "name": "IcicleTreeLayout",
            "size": 4864
          },
          {
            "name": "DendrogramLayout",
            "size": 4853
          },
          {
            "name": "ForceDirectedLayout",
            "size": 8411
          },
          {
            "name": "BundledEdgeRouter",
            "size": 3727
          },
          {
            "name": "IndentedTreeLayout",
            "size": 3174
          },
          {
            "name": "PieLayout",
            "size": 2728
          },
          {
            "name": "RandomLayout",
            "size": 870
          }
        ]
      },
      {
        "name": "OperatorList",
        "size": 5248
      },
      {
        "name": "OperatorSequence",
        "size": 4190
      },
      {
        "name": "OperatorSwitch",
        "size": 2581
      },
      {
        "name": "Operator",
        "size": 2490
      },
      {
        "name": "SortOperator",
        "size": 2023
      }
    ]
  }
]
sankey_data = {
  "nodes": [
    {
      "name": "Visit"
    },
    {
      "name": "Direct-Favourite"
    },
    {
      "name": "Page-Click"
    },
    {
      "name": "Detail-Favourite"
    },
    {
      "name": "Lost"
    }
  ],
  "links": [
    {
      "source": 0,
      "target": 1,
      "value": 3728.3
    },
    {
      "source": 0,
      "target": 2,
      "value": 354170
    },
    {
      "source": 2,
      "target": 3,
      "value": 62429
    },
    {
      "source": 2,
      "target": 4,
      "value": 291741
    }
  ]
}
composed_data = [
  {
    "name": "Page A",
    "uv": 4000,
    "pv": 2400,
    "amt": 2400
  },
  {
    "name": "Page B",
    "uv": 3000,
    "pv": 1398,
    "amt": 2210
  },
  {
    "name": "Page C",
    "uv": 2000,
    "pv": 9800,
    "amt": 2290
  },
  {
    "name": "Page D",
    "uv": 2780,
    "pv": 3908,
    "amt": 2000
  },
  {
    "name": "Page E",
    "uv": 1890,
    "pv": 4800,
    "amt": 2181
  },
  {
    "name": "Page F",
    "uv": 2390,
    "pv": 3800,
    "amt": 2500
  },
  {
    "name": "Page G",
    "uv": 3490,
    "pv": 4300,
    "amt": 2100
  }
]

page = Page(
    __name__,
    core.Container([
        core.Container([
            core.Box([
                charts.LineChart(
                    data=data,
                    width=500,
                    height=300,
                    identity='line-chart',
                    lines=[charts.Line(dataKey='y')],
                    cartesian_grid=charts.CartesianGrid(),
                    y_axis=[charts.YAxis()],
                    x_axis=[charts.XAxis(dataKey='x')],
                    tooltip=charts.Tooltip(),
                    legend=charts.Legend(),
                    margin=margin,
                ),
                charts.AreaChart(
                    data=data,
                    width=500,
                    height=300,
                    margin=margin,
                    identity='area-chart',
                    reference_areas=[charts.ReferenceArea(
                        x1=0, x2=180, y1=0, y2=10,
                        stroke='red', strokeOpacity=0.5
                    )],
                    areas=[
                        charts.Area(
                            dataKey='y', type='monotone', stroke="#8884d8",
                            fillOpacity=0.8, fill=colors[2],
                        ),
                    ],
                    y_axis=[charts.YAxis()],
                    x_axis=[charts.XAxis(dataKey='x')],
                    tooltip=charts.Tooltip(),
                    legend=charts.Legend(),
                    cartesian_grid=charts.CartesianGrid(strokeDasharray='2 3'),
                ),
                charts.BarChart(
                    data=data,
                    width=500,
                    height=300,
                    identity='bar-chart',
                    bars=[
                        charts.Bar(
                            dataKey='y', fill=colors[0],
                            label_lists=[
                                charts.LabelList(
                                    dataKey='u',
                                    width=500,
                                    height=300,
                                    fill='#000', position='top',
                                )
                            ]
                        ),
                        charts.Bar(dataKey='z', fill=colors[1])
                    ],
                    y_axis=[charts.YAxis()],
                    x_axis=[charts.XAxis(dataKey='x')],
                    tooltip=charts.Tooltip(),
                    legend=charts.Legend(),
                    handle_clicks=True,
                    handle_hover=True,
                ),
                charts.FunnelChart(
                    width=500,
                    height=300,
                    margin=margin,
                    funnels=[charts.Funnel('value', data=[
                        {
                            'value': i * 20,
                            'fill': colors[i],
                            'name': f'random{i}'
                        } for i in range(5)
                    ], label_lists=[
                        charts.LabelList(
                            dataKey='name', position='left',
                            fill='#000'
                        )])],
                    tooltip=charts.Tooltip(),
                ),
                charts.ScatterChart(
                    height=300,
                    width=500,
                    identity='scatter-chart',
                    scatters=[
                        charts.Scatter(
                            name='Series A',
                            data=data,
                            fill=colors[2]
                        ),
                    ],
                    legend=charts.Legend(),
                    tooltip=charts.Tooltip(),
                    x_axis=[
                        charts.XAxis(dataKey='x', name='length', unit='cm')],
                    y_axis=[
                        charts.YAxis(dataKey='y', name='weight', unit='kg')],
                    z_axis=[
                        charts.ZAxis(dataKey='z', name='score', unit='km')],
                    cartesian_grid=charts.CartesianGrid(strokeDasharray='1 3'),
                    reference_areas=[charts.ReferenceArea(
                        x1=200, x2=260, y1=10, y2=18,
                        stroke='red', strokeOpacity=0.5,
                        fill=colors[0], fillOpacity=0.5
                    )],
                    reference_lines=[
                        charts.ReferenceLine(
                            y=14, label='middle',
                            stroke='blue', strokeDasharray='1 1'
                        )
                    ],
                    reference_dots=[
                        charts.ReferenceDot(
                            y=9, x=200, fill='green', stroke='blue',
                        )
                    ]
                ),
                charts.PieChart(
                    width=500,
                    height=300,
                    margin=margin,
                    identity='pie',
                    legend=charts.Legend(),
                    tooltip=charts.Tooltip(),
                    pies=[
                        charts.Pie(dataKey='value', data=[
                            {'value': 200, 'name': 'foo', 'fill': colors[1]},
                            {'value': 400, 'name': 'bar', 'fill': colors[2]},
                            {'value': 140, 'name': 'help', 'fill': colors[3]}
                        ])
                    ]
                ),
                charts.RadarChart(
                    width=500,
                    height=300,
                    margin=margin,
                    outer_radius=90,
                    data=radar_data,
                    legend=charts.Legend(),
                    tooltip=charts.Tooltip(),
                    identity='radar',
                    radars=[
                        charts.Radar(
                            name='Alice', dataKey='a',
                            fill=colors[0], fillOpacity=0.6
                        ),
                        charts.Radar(
                            name='Bob', dataKey='b',
                            fill=colors[1], fillOpacity=0.6,
                        ),
                    ],
                    polar_grid=charts.PolarGrid(True),
                    polar_angle_axis=[charts.PolarAngleAxis(dataKey='type')],
                    polar_radius_axis=[
                        charts.PolarRadiusAxis(angle=30, domain=[0, 150])
                    ]
                ),
                charts.RadialBarChart(
                    width=500,
                    height=300,
                    margin=margin,
                    identity='radial',
                    data=radar_data,
                    legend=charts.Legend(),
                    tooltip=charts.Tooltip(),
                    radial_bars=[
                        charts.RadialBar(
                            dataKey='a', background=True,
                        )
                    ]
                ),
                charts.Treemap(
                    width=500,
                    height=300,
                    margin=margin,
                    data=treemap_data,
                    dataKey='size',
                    aspectRatio=4 / 3,
                ),
                charts.SankeyChart(
                    width=500,
                    height=300,
                    margin=margin,
                    identity='sankey',
                    nodePadding=50,
                    link={'stroke': colors[0]},
                    data=sankey_data,
                    nameKey='name',
                    tooltip=charts.Tooltip(),
                ),
                charts.ComposedChart(
                    width=500,
                    height=300,
                    margin=margin,
                    data=composed_data,
                    identity='composed',
                    x_axis=[charts.XAxis(dataKey='name')],
                    y_axis=[charts.YAxis()],
                    tooltip=charts.Tooltip(),
                    legend=charts.Legend(),
                    cartesian_grid=charts.CartesianGrid(stroke='#f5f5f5'),
                    areas=[charts.Area(type='monotone', dataKey='amt', fill=colors[0], stroke=colors[0])],
                    bars=[charts.Bar(dataKey='pv', barSize=20, fill=colors[2])],
                    lines=[
                        charts.Line(
                            type='monotone',
                            dataKey='uv',
                            stroke=colors[4]
                        )
                    ]
                ),
            ], justify='center', wrap='wrap'),
            core.Container([
               core.Box([
                   core.Button('prepend data', identity='prepend-data'),
                   core.Button('append data', identity='append-data'),
                   core.Button('concat data', identity='concat-data'),
                   core.Button('delete data', identity='delete-data'),
                   core.Button('insert data', identity='insert-data'),
                   core.Button('sort data', identity='sort-data'),
               ]),
            ]),
            core.Container([
                core.Container(identity='hovered-output'),
                core.Container(identity='hover-event-output'),
                core.Container(identity='clicks-output'),
                core.Container(identity='click-event-output'),
            ])
        ]),
    ]),
)


page.tie('clicks@bar-chart', 'children@clicks-output')
page.tie('hovered@bar-chart', 'children@hovered-output').t(t.ToJson())
page.tie('click_event@bar-chart', 'children@click-event-output').t(t.ToJson())
page.tie('hover_event@bar-chart', 'children@hover-event-output').t(t.ToJson())


@page.bind('clicks@prepend-data')
async def on_click_prepend(ctx: BindingContext):
    await ctx.set_aspect('line-chart', prepend_data={
        "y": 100,
        'z': 120,
        'x': 110,
        'name': f'prepended',
        'u': f'under110'
    })


@page.bind('clicks@append-data')
async def on_click_prepend(ctx: BindingContext):
    await ctx.set_aspect('line-chart', append_data={
        "y": 100,
        'z': 120,
        'x': 110,
        'name': f'appended',
        'u': f'under111'
    })


@page.bind('clicks@insert-data')
async def on_click_prepend(ctx: BindingContext):
    await ctx.set_aspect('line-chart', insert_data={
        'value': {
            "y": 100,
            'z': 120,
            'x': 110,
            'name': f'named112',
            'u': f'under112'
        },
        'index': 1
    })


@page.bind('clicks@delete-data')
async def on_click_delete_data(ctx: BindingContext):
    await ctx.set_aspect('line-chart', delete_data={
        'key': 'name', 'value': 'named1'
    })


@page.bind('clicks@concat-data')
async def on_click_prepend(ctx: BindingContext):
    await ctx.set_aspect('line-chart', concat_data=[{
        "y": 80,

        'z': 100,
        'x': 60,
        'name': f'concat',
        'u': f'undercat'
    }])


@page.bind('clicks@sort-data')
async def on_click_sort(ctx: BindingContext):
    await ctx.set_aspect('line-chart', sort_data={'key': 'x'})
