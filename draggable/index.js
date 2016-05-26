import {Component, _} from 'rgui-base';
import dragdrop from '../dragdrop';

/**
 * @class Draggable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {var}                     options.data.value               => 拖拽时需要传递的值
 * @param {string|Dragable.Proxy|Element|function='clone'}  options.data.proxy  @=> 拖拽代理，即拖拽时显示的元素。默认值为`clone`，拖拽时拖起自身的一个拷贝；当值为`self`，拖拽时直接拖起自身。也可以用`<draggable.proxy>`自定义代理，或直接传入一个元素或函数。其他值表示不使用拖拽代理。
 * @param {string='all'}            options.data.direction           => 拖拽代理可以移动的方向，`all`为任意方向，`horizontal`为水平方向，`vertical`为垂直方向
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {string='z-draggable'}    options.data.class               => 可拖拽时（即disabled=false）给元素附加此class
 * @param {string='z-drag'}         options.data.dragClass           => 拖拽该元素时给元素附加此class
 */
let Draggable = Component.extend({
    name: 'draggable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config() {
        this.data = Object.assign({
            value: undefined,
            proxy: 'clone',
            direction: 'all',
            'class': 'z-draggable',
            dragClass: 'z-drag'
        }, this.data);
        this.supr();

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onBodyMouseMove = this._onBodyMouseMove.bind(this);
        this._onBodyMouseUp = this._onBodyMouseUp.bind(this);
        this.cancel = this.cancel.bind(this);
    },
    /**
     * @protected
     */
    init() {
        let inner = _.dom.element(this);
        _.dom.on(inner, 'mousedown', this._onMouseDown);
        this.supr();

        this.$watch('disabled', (newValue) =>
            _.dom[newValue ? 'delClass' : 'addClass'](inner, this.data['class']));
    },
    /**
     * @method _getProxy() 获取拖拽代理
     * @private
     * @return {Element} 拖拽代理元素
     */
    _getProxy() {
        let proxy;
        if(typeof this.data.proxy === 'function')
            return this.data.proxy();
        else if(this.data.proxy instanceof Element)
            return this.data.proxy;
        else if(this.data.proxy instanceof Draggable.Proxy) {
            proxy = _.dom.element(this.data.proxy);
            let dimension = _.dom.getDimension(_.dom.element(this));
            this._initProxy(proxy, dimension);
            document.body.appendChild(proxy);
            return proxy;
        } else if(this.data.proxy === 'clone') {
            let self = _.dom.element(this);
            let dimension = _.dom.getDimension(self);
            proxy = self.cloneNode(true);
            this._initProxy(proxy, dimension);
            self.parentElement.appendChild(proxy);
            return proxy;
        } else if(this.data.proxy === 'self') {
            proxy = _.dom.element(this);
            let dimension = _.dom.getDimension(proxy);
            this._initProxy(proxy, dimension);
            return proxy;
        }
    },
    /**
     * @method _initProxy() 初始化拖拽代理
     * @private
     * @return {void}
     */
    _initProxy(proxy, dimension) {
        proxy.style.left = dimension.left + 'px';
        proxy.style.top = dimension.top + 'px';
        proxy.style.zIndex = '2000';
        proxy.style.position = 'fixed';
        proxy.style.display = '';
    },
    /**
     * @private
     */
    _onMouseDown($event) {
        if(this.data.disabled)
            return;
        $event.preventDefault();

        _.dom.on(document, 'mousemove', this._onBodyMouseMove);
        _.dom.on(document, 'mouseup', this._onBodyMouseUp);
    },
    /**
     * @private
     */
    _onBodyMouseMove($event) {
        let e = $event.event;
        $event.preventDefault();

        if(dragdrop.dragging === false) {
            Object.assign(dragdrop, {
                dragging: true,
                value: this.data.value,
                proxy: this._getProxy(),
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
                movementX: 0,
                movementY: 0,
                droppable: undefined
            });

            this._dragStart();
        } else {
            Object.assign(dragdrop, {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
                movementX: e.screenX - dragdrop.screenX,
                movementY: e.screenY - dragdrop.screenY
            });

            if(dragdrop.proxy) {
                if(this.data.direction === 'all' || this.data.direction === 'horizontal')
                    dragdrop.proxy.style.left = dragdrop.proxy.offsetLeft + dragdrop.movementX + 'px';
                if(this.data.direction === 'all' || this.data.direction === 'vertical')
                    dragdrop.proxy.style.top = dragdrop.proxy.offsetTop + dragdrop.movementY + 'px';
            }

            this._drag();
            if(!dragdrop.dragging)
                return;

            // Drop
            let pointElement = null;
            if(dragdrop.proxy) {
                dragdrop.proxy.style.display = 'none';
                pointElement = document.elementFromPoint(e.clientX, e.clientY);
                dragdrop.proxy.style.display = '';
            } else
                pointElement = document.elementFromPoint(e.clientX, e.clientY);
            // console.log(pointElement);

            let pointDroppable = null;
            while(pointElement) {
                pointDroppable = dragdrop.droppables.find((droppable) =>
                    _.dom.element(droppable) === pointElement);

                if(pointDroppable)
                    break;
                else
                    pointElement = pointElement.parentElement;
            }

            if(dragdrop.droppable !== pointDroppable) {
                dragdrop.droppable && dragdrop.droppable._dragLeave(this);
                if(!dragdrop.dragging)
                    return;
                pointDroppable && pointDroppable._dragEnter(this);
                if(!dragdrop.dragging)
                    return;
                dragdrop.droppable = pointDroppable;
            } else
                pointDroppable && pointDroppable._dragOver(this);
        }
    },
    /**
     * @private
     */
    _onBodyMouseUp($event) {
        let e = $event.event;
        $event.preventDefault();

        dragdrop.droppable && dragdrop.droppable._drop(this);
        this.cancel();
    },
    /**
     * @method cancel() 取消拖拽操作
     * @public
     * @return {void}
     */
    cancel() {
        this._dragEnd();

        Object.assign(dragdrop, {
            dragging: false,
            value: undefined,
            proxy: undefined,
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            movementX: 0,
            movementY: 0,
            droppable: undefined
        });

        _.dom.off(document, 'mousemove', this._onBodyMouseMove);
        _.dom.off(document, 'mouseup', this._onBodyMouseUp);
    },
    /**
     * @private
     */
    _dragStart() {
        if(dragdrop.proxy)
            _.dom.addClass(dragdrop.proxy, this.data.dragClass);

        /**
         * @event dragstart 拖拽开始时触发
         * @property {object} sender 事件发送对象，为当前draggable
         * @property {object} origin 拖拽源，为当前draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {var} value 拖拽时需要传递的值
         * @property {number} screenX 鼠标指针相对于屏幕的水平位置
         * @property {number} screenY 鼠标指针相对于屏幕的垂直位置
         * @property {number} clientX 鼠标指针相对于浏览器的水平位置
         * @property {number} clientY 鼠标指针相对于浏览器的垂直位置
         * @property {number} pageX 鼠标指针相对于页面的水平位置
         * @property {number} pageY 鼠标指针相对于页面的垂直位置
         * @property {number} movementX 鼠标指针水平位置相对于上次操作的偏移量
         * @property {number} movementY 鼠标指针垂直位置相对于上次操作的偏移量
         * @property {function} cancel 取消拖拽操作
         */
        this.$emit('dragstart', Object.assign({
            sender: this,
            origin: this,
            source: _.dom.element(this),
            cancel: this.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _drag() {
        /**
         * @event drag 正在拖拽时触发
         * @property {object} sender 事件发送对象，为当前draggable
         * @property {object} origin 拖拽源，为当前draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {var} value 拖拽时需要传递的值
         * @property {number} screenX 鼠标指针相对于屏幕的水平位置
         * @property {number} screenY 鼠标指针相对于屏幕的垂直位置
         * @property {number} clientX 鼠标指针相对于浏览器的水平位置
         * @property {number} clientY 鼠标指针相对于浏览器的垂直位置
         * @property {number} pageX 鼠标指针相对于页面的水平位置
         * @property {number} pageY 鼠标指针相对于页面的垂直位置
         * @property {number} movementX 鼠标指针水平位置相对于上次操作的偏移量
         * @property {number} movementY 鼠标指针垂直位置相对于上次操作的偏移量
         * @property {function} cancel 取消拖拽操作
         */
        this.$emit('drag', Object.assign({
            sender: this,
            origin: this,
            source: _.dom.element(this),
            cancel: this.cancel
         }, dragdrop));
    },
    /**
     * @private
     */
    _dragEnd() {
        /**
         * @event dragend 拖拽结束时触发
         * @property {object} sender 事件发送对象，为当前draggable
         * @property {object} origin 拖拽源，为当前draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         */
        this.$emit('dragend', {
            sender: this,
            origin: this,
            source: _.dom.element(this),
            proxy: dragdrop.proxy
        });

        if(dragdrop.proxy) {
            if(this.data.proxy instanceof Draggable.Proxy || this.data.proxy === 'clone')
                dragdrop.proxy.parentElement.removeChild(dragdrop.proxy);

            _.dom.delClass(dragdrop.proxy, this.data.dragClass);
        }
    }
});

Draggable.Proxy = Component.extend({
    name: 'draggable.proxy',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    init() {
        if(this.$outer instanceof Draggable) {
            _.dom.element(this).style.display = 'none';
            this.$outer.data.proxy = this;
        }
    }
    // node: _.noop
});

export default Draggable;
