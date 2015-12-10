/**
 * ------------------------------------------------------------
 * Draggable  拖拽
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('regular-ui-base/src/component');
var _ = require('regular-ui-base/src/_');
var dragdrop = require('./dragdrop.js');

/**
 * @class Draggable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {object}                  options.data.data                => 拖拽时需要传递的数据
 * @param {string|Dragable.Proxy|Element|function='clone'}  options.data.proxy  @=> 拖拽代理，即拖拽时显示的元素。默认值为`clone`，拖拽时拖起自身的一个拷贝；当值为`self`，拖拽时直接拖起自身。也可以用`<draggable.proxy>`自定义代理，或直接传入一个元素或函数。其他值表示不使用拖拽代理。
 * @param {string='all'}            options.data.direction           => 拖拽代理可以移动的方向，`all`为任意方向，`horizontal`为水平方向，`vertical`为垂直方向
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {string='z-draggable'}    options.data.class               => 可拖拽时（即disabled=false）给元素附加此class
 * @param {string='z-drag'}         options.data.dragClass           => 拖拽该元素时给元素附加此class
 */
var Draggable = Component.extend({
    name: 'draggable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            data: null,
            proxy: 'clone',
            direction: 'all',
            'class': 'z-draggable',
            dragClass: 'z-drag'
        });
        this.supr();

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onBodyMouseMove = this._onBodyMouseMove.bind(this);
        this._onBodyMouseUp = this._onBodyMouseUp.bind(this);
        this.cancel = this.cancel.bind(this);
    },
    /**
     * @protected
     */
    init: function() {
        var inner = _.dom.element(this);
        _.dom.on(inner, 'mousedown', this._onMouseDown);
        this.supr();

        this.$watch('disabled', function(newValue) {
            if(newValue)
                _.dom.delClass(inner, this.data['class']);
            else
                _.dom.addClass(inner, this.data['class']);
        });
    },
    /**
     * @method _getProxy() 获取拖拽代理
     * @private
     * @return {Element} 拖拽代理元素
     */
    _getProxy: function() {
        if(typeof this.data.proxy === 'function')
            return this.data.proxy();
        else if(this.data.proxy instanceof Element)
            return this.data.proxy;
        else if(this.data.proxy instanceof Draggable.Proxy) {
            var proxy = _.dom.element(this.data.proxy);
            var dimension = _.dom.getDimension(_.dom.element(this));
            this._initProxy(proxy, dimension);
            document.body.appendChild(proxy);
            return proxy;
        } else if(this.data.proxy === 'clone') {
            var self = _.dom.element(this);
            var dimension = _.dom.getDimension(self);
            proxy = self.cloneNode(true);
            this._initProxy(proxy, dimension);
            self.parentElement.appendChild(proxy);
            return proxy;
        } else if(this.data.proxy === 'self') {
            var proxy = _.dom.element(this);
            var dimension = _.dom.getDimension(proxy);
            this._initProxy(proxy, dimension);
            return proxy;
        }
    },
    /**
     * @method _initProxy() 初始化拖拽代理
     * @private
     * @return {void}
     */
    _initProxy: function(proxy, dimension) {
        proxy.style.left = dimension.left + 'px';
        proxy.style.top = dimension.top + 'px';
        proxy.style.zIndex = '2000';
        proxy.style.position = 'fixed';
        proxy.style.display = '';
    },
    /**
     * @private
     */
    _onMouseDown: function($event) {
        if(this.data.disabled)
            return;
        $event.preventDefault();

        _.dom.on(document.body, 'mousemove', this._onBodyMouseMove);
        _.dom.on(document.body, 'mouseup', this._onBodyMouseUp);
    },
    /**
     * @private
     */
    _onBodyMouseMove: function($event) {
        var e = $event.event;
        $event.preventDefault();

        if(dragdrop.dragging === false) {
            _.extend(dragdrop, {
                dragging: true,
                data: this.data.data,
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
            }, true);

            this._dragStart();
        } else {
            _.extend(dragdrop, {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
                movementX: e.screenX - dragdrop.screenX,
                movementY: e.screenY - dragdrop.screenY
            }, true);

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
            dragdrop.proxy.style.display = 'none';
            var pointElement = document.elementFromPoint(e.clientX, e.clientY);
            dragdrop.proxy.style.display = '';

            var pointDroppable = dragdrop.droppables.find(function(droppable) {
                return _.dom.element(droppable) === pointElement;
            });

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
    _onBodyMouseUp: function($event) {
        var e = $event.event;
        $event.preventDefault();

        dragdrop.droppable && dragdrop.droppable._drop(this);
        this.cancel();
    },
    /**
     * @method cancel() 取消拖拽操作
     * @public
     * @return {void}
     */
    cancel: function() {
        this._dragEnd();

        _.extend(dragdrop, {
            dragging: false,
            data: null,
            proxy: null,
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            movementX: 0,
            movementY: 0,
            droppable: undefined
        }, true);

        _.dom.off(document.body, 'mousemove', this._onBodyMouseMove);
        _.dom.off(document.body, 'mouseup', this._onBodyMouseUp);
    },
    /**
     * @private
     */
    _dragStart: function(e) {
        if(dragdrop.proxy)
            _.dom.addClass(dragdrop.proxy, this.data.dragClass);

        /**
         * @event dragstart 拖拽开始时触发
         * @property {object} source 事件发起对象，为当前draggable
         * @property {object} target 事件目标对象，为拖拽代理元素
         * @property {object} origin 事件源，即拖拽源，为当前draggable
         * @property {object} data 拖拽时需要传递的数据
         * @property {object} proxy 拖拽代理元素
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
        this.$emit('dragstart', _.extend({
            source: this,
            target: dragdrop.proxy,
            origin: this,
            proxy: dragdrop.proxy,
            cancel: this.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _drag: function() {
        /**
         * @event drag 正在拖拽时触发
         * @property {object} source 事件发起对象，为当前draggable
         * @property {object} target 事件目标对象，为拖拽代理元素
         * @property {object} origin 事件源，即拖拽源，为当前draggable
         * @property {object} data 拖拽时需要传递的数据
         * @property {object} proxy 拖拽代理元素
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
        this.$emit('drag', _.extend({
            source: this,
            target: dragdrop.proxy,
            origin: this,
            proxy: dragdrop.proxy,
            cancel: this.cancel
         }, dragdrop));
    },
    /**
     * @private
     */
    _dragEnd: function() {
        /**
         * @event dragend 拖拽结束时触发
         * @property {object} source 事件发起对象，为当前draggable
         * @property {object} target 事件目标对象，为拖拽代理元素
         * @property {object} origin 事件源，即拖拽源，为当前draggable
         * @property {object} proxy 拖拽代理元素
         */
        this.$emit('dragend', {
            source: this,
            target: dragdrop.proxy,
            origin: this,
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
    init: function() {
        if(this.$outer instanceof Draggable) {
            _.dom.element(this).style.display = 'none';
            this.$outer.data.proxy = this;
        }
    }
    // node: _.noop
})

module.exports = Draggable;