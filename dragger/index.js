import Draggable from '../draggable';

/**
 * @class Draggable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {var}                     options.data.value               => 拖拽时需要传递的值
 * @param {string|Dragable.Proxy|Element|function='clone'}  options.data.proxy  @=> 拖拽代理，即拖拽时移动的元素。默认值为`clone`，拖拽时拖起自身的一个拷贝；当值为`self`，拖拽时直接拖起自身。也可以用`<draggable.proxy>`自定义代理，或直接传入一个元素或函数。其他值表示不使用拖拽代理。
 * @param {string='both'}           options.data.axis                => 拖拽代理移动时限制的轴向，`both`表示可以在任意方向上移动，`horizontal`表示限制在水平方向上移动，`vertical`表示限制在垂直方向上移动
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {string='z-draggable'}    options.data.class               => 可拖拽时（即disabled=false）给元素附加此class
 * @param {string='z-drag'}         options.data.dragClass           => 拖拽该元素时给元素附加此class
 */
let Dragger = Draggable.extend({
    name: 'dragger',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config() {
        this.data = Object.assign({
            // value: undefined,
            // proxy: 'clone',
            range: 'parent',
            axis: 'both',
            // grid
            // snap
            // 'class': 'z-draggable',
            // dragClass: 'z-drag'
        }, this.data);
        this.supr();

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this.cancel = this.cancel.bind(this);
    },
    /**
     * @method _getRange(proxy) 获取拖拽范围
     * @private
     * @return {Element} 拖拽范围元素
     */
    _getRange(proxy) {
        let range;
        if(this.data.range === 'parent')
            return proxy.parentElement;
    },
    /**
     * @protected
     * @override
     */
    restrict(dragdrop) {
        if(dragdrop.range) {
            let dimension = _.dom.getDimension(dragdrop.range);
            dragdrop.dragLeft = Math.min(Math.max(0, dragdrop.startLeft + dragdrop.dragLeft), dimension.width) - dragdrop.startLeft;
            dragdrop.dragTop = Math.min(Math.max(0, dragdrop.startTop + dragdrop.dragTop), dimension.height) - dragdrop.startTop;
        }

        if(this.data.axis === 'vertical')
            dragdrop.dragLeft = 0;
        if(this.data.axis === 'horizontal')
            dragdrop.dragTop = 0;
    }
});

export default Dragger;
