"""
Page markdown of dazzler
Created 2019-08-19
"""
from dazzler.components import core, markdown as md
from dazzler.system import Page


text = '''
# Foo
## Bar
[google](http://google.com)

```jsx
const Foo = props => <div>{props.text}</div>;
```
'''

page = Page(
    __name__,
    core.Container([
        md.Markdown(text, identity='markdown'),
        md.CodeBlock(value=text, language='md')
    ])
)
