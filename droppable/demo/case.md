#### 列表排序（根据中点计算）

<div class="m-example"></div>

```css
.m-gridview {list-style: none; overflow: auto; margin: 0; padding: 0; width: 360px;}
.m-gridview li {float: left;}
.u-app {user-select: none; cursor: default; width: 60px; height: 60px; margin: 8px; border-radius: 8px; font-size: 16px; line-height: 60px; text-align: center; background: #00c0ef; color: white;}
```

```xml
<ul class="m-gridview">
    {#list list as item}
    <draggable
        value={item}
        on-dragstart={this._onItemDragStart($event)}
        on-drag={this._onItemDrag($event)}
        on-dragend={this._onItemDragEnd($event)}>
        <li><div class="u-app">{item.text}</div></li>
    </draggable>
    {/list}
</ul>
```

```javascript
let _ = RGUI.util;
let list = [];
for(let i = 0; i < 15; i++)
    list.push({text: '选项' + i});

let component = new RGUI.Component({
    template: template,
    data: {list: list},
    _onItemDragStart($event) {
        $event.source.style.visibility = 'hidden';
    },
    _onItemDrag($event) {
        // 获取拖拽起始元素的位置
        let source = $event.source;
        let parent = source.parentElement;
        let children = Array.from(parent.children);
        let sourceIndex = children.indexOf(source);

        // 获取拖拽代理元素的中点
        let proxy = $event.proxy;
        let proxyDimension = _.dom.getDimension(proxy);
        let proxyMiddle = {
            x: proxyDimension.left + proxyDimension.width/2,
            y: proxyDimension.top + proxyDimension.height/2,
        };

        // 获取当前拖拽的位置
        let target = null;
        let targetIndex = -1;
        for(let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i];
            // 跳过拖拽起始元素和代理元素
            if(child === source || child === proxy)
                continue;

            let childDimension = _.dom.getDimension(child);
            // 根据拖拽代理元素的中点，判断当前拖动到哪个位置上了
            if(childDimension.left < proxyMiddle.x && proxyMiddle.x <= childDimension.left + childDimension.width
                && childDimension.top < proxyMiddle.y && proxyMiddle.y <= childDimension.top + childDimension.height) {
                target = child;
                targetIndex = i;
                break;
            }
        }

        // 判断位置是否在最后一个外面
        if(targetIndex === -1) {
            let childIndex = parent.children.length - 2;    // 最后一个为代理元素
            let child = parent.children[childIndex];
            let childDimension = _.dom.getDimension(child);
            if(proxyMiddle.x > childDimension.left && proxyMiddle.y > childDimension.top) {
                target = child;
                targetIndex = childIndex;
            }
        }

        if(!target)
            return;

        parent.removeChild(source);
        if(targetIndex < sourceIndex)
            parent.insertBefore(source, target);
        else
            parent.insertBefore(source, target.nextElementSibling);
    },
    _onItemDragEnd($event) {
        $event.source.style.visibility = '';
        // 获取拖拽后起始元素的位置
        let source = $event.source;
        let parent = source.parentElement;
        let children = Array.from(parent.children);
        let sourceIndex = children.indexOf(source);
        // 更新list
        let list = this.data.list;
        let value = $event.sender.data.value;
        list.splice(list.indexOf(value), 1);
        list.splice(sourceIndex, 0, value);
    }
});
```

#### 列表排序（根据鼠标位置计算）

<div class="m-example"></div>

```xml
<ul class="m-gridview">
    {#list list as item}
        <droppable
            on-dragover={this._onItemDragOver($event)}>
        <draggable
            value={item}
            on-dragstart={this._onItemDragStart($event)}
            on-dragend={this._onItemDragEnd($event)}>
            <li><div class="u-app">{item.text}</div></li>
        </draggable>
        </droppable>
    {/list}
</ul>
```

```javascript
let _ = RGUI.util;
let list = [];
for(let i = 0; i < 15; i++)
    list.push({text: '选项' + i});

let component = new RGUI.Component({
    template: template,
    data: {list: list},
    _onItemDragStart($event) {
        $event.source.style.visibility = 'hidden';
    },
    _onItemDragOver($event) {
        let source = $event.source;
        let target = $event.target;
        let parent = source.parentElement;
        let children = Array.from(parent.children);
        let sourceIndex = children.indexOf(source);
        let targetIndex = children.indexOf(target);
        
        parent.removeChild(source);
        if(targetIndex < sourceIndex)
            parent.insertBefore(source, target);
        else
            parent.insertBefore(source, target.nextElementSibling);
    },
    _onGridViewDragOver($event) {
        let source = $event.source;
        let parent = source.parentElement;
        let last = parent.children[parent.children.length - 1];

        // @TODO: 判断位置是否在最后一个外面
    },
    _onItemDragEnd($event) {
        $event.source.style.visibility = '';
        // 获取拖拽后起始元素的位置
        let source = $event.source;
        let parent = source.parentElement;
        let children = Array.from(parent.children);
        let sourceIndex = children.indexOf(source);
        // 更新list
        let list = this.data.list;
        let value = $event.sender.data.value;
        list.splice(list.indexOf(value), 1);
        list.splice(sourceIndex, 0, value);
    }
});
```
