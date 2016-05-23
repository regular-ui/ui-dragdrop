### 无数据交换的拖拽排序

#### 列表排序

<div class="m-example"></div>

```xml
<ul class="m-listview">
    {#list list as item}
    <draggable direction="vertical"
        on-dragstart={this._onItemDragStart($event)}
        on-drag={this._onItemDrag($event)}
        on-dragend={this._onItemDragEnd($event)}>
        <li z-sel={selected === item} on-click={selected = item}>{item.text}</li>
    </draggable>
    {/list}
</ul>
```

```javascript
let _ = RGUI.util;
let component = new RGUI.Component({
    template: template,
    data: {
        list: [
            {text: '选项1'},
            {text: '选项2'},
            {text: '选项3'},
            {text: '选项4'},
            {text: '选项5'},
        ]
    },
    _onItemDragStart($event) {
        $event.source.style.visibility = 'hidden';
    },
    _onItemDragEnd($event) {
        $event.source.style.visibility = '';
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
        let proxyMiddle = proxyDimension.top + proxyDimension.height/2;

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
            if(childDimension.top < proxyMiddle && childDimension.top + childDimension.height > proxyMiddle) {
                target = child;
                targetIndex = i;
                break;
            }
        }

        if(!target)
            return;

        parent.removeChild(source);
        if(targetIndex < sourceIndex)
            parent.insertBefore(source, target);
        else
            parent.insertBefore(source, target.nextElementSibling);
    }
});
```
