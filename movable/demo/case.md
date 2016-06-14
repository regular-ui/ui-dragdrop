### 案例
#### Slider

<div class="m-example"></div>

```xml
<div class="g-row">
    <div class="g-col g-col-6">
        <div class="u-slider">
            <div class="slider_bar" style="width: {percent}%"></div>
            <movable axis="horizontal" range="parent" rangeMode="none"
                on-drag={this._onDrag($event)}>
                <div class="slider_btn" style="left: {percent}%"></div>
            </movable>
        </div>
    </div>
    <div class="g-col g-col-6">
        <div class="u-slider">
            <div class="slider_bar" style="width: {percent2}%"></div>
            <movable axis="horizontal" range="parent" rangeMode="none" grid={ [20, 1] }
                on-drag={this._onDrag($event)}>
                <div class="slider_btn" style="left: {percent2}%"></div>
            </movable>
        </div>
    </div>
</div>
```

```css
.u-slider {position: relative; height: 6px; line-height: 6px; background: #e6e6e6;}
    .slider_bar {float: left; height: 6px; line-height: 6px; background: #67aaf5;}
    .slider_btn {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        margin-top: -9px;
        margin-left: -7px;
        width: 14px;
        height: 24px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 2px;
    }
```

```javascript
let component = new RGUI.Component({
    template: template,
    data: {
        percent: 20,
        percent2: 20
    },
    _onDrag($event) {
        this.data.percent = $event.currentLeft/$event.range.right*100;
    }
});

```

#### Pallette

<div class="m-example"></div>

```xml
<div class="m-pallette">
    <div class="pallette_SV">
        <movable range="parent" rangeMode="none">
            <div class="pallette_SV_btn" style="left: 100px; top: 100px;"></div>
        </movable>
    </div>
</div>
```

```css
.m-pallette {}
.m-pallette .pallette_SV {position: relative; overflow: hidden; background: #f09; width: 256px; height: 256px;}
.m-pallette .pallette_SV:before, .m-pallette .pallette_SV:after {
    content: ''; display: block;
    position: absolute; left: 0; right: 0; top: 0; bottom: 0;
}
.m-pallette .pallette_SV:before {background: linear-gradient(to right, white, rgba(255, 255, 255, 0));}
.m-pallette .pallette_SV:after {background: linear-gradient(to top, black, rgba(0, 0, 0, 0));}
.m-pallette .pallette_SV_btn {box-sizing: border-box; position: absolute; z-index: 5; margin-left: -8px; margin-top: -8px; width: 16px; height: 16px; border: 1px solid white; border-radius: 100%; box-shadow: 0 0 1px rgba(0, 0, 0, .5), inset 0 0 1px rgba(0, 0, 0, .5);}
```
