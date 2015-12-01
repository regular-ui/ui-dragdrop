/**
 * ------------------------------------------------------------
 * Draggable  拖拽
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('regular-ui-base/src/component');
var _ = require('regular-ui-base/src/_');
var dragDrop = require('./dragDrop.js');

/**
 * @class Draggable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {string|Dragable.Proxy|function='auto'}  options.data.proxy  @=> 拖拽时的图像。值为`auto`拖拽时，复制一个拖拽元素的图像（浏览器的默认设置），值为`empty`拖拽时不显示图像，可以用`<draggable.proxy>`自定义图像。也可以直接传入一个函数，要求返回{proxy: 图像元素, x: 横向偏移, y: 纵向偏移}。
 * @param {string}                  options.data.effect              => 效果（与浏览器的effectAllowed一致）。可选的值有`none`、`uninitialized`、`all`、`copy`、`move`、`link`、`copyLink`、`copyMove`、`linkMove`。
 * @param {object}                  options.data.data                => 拖拽时需要传递的数据
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 */
var Draggable = Component.extend({
    name: 'draggable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            proxy: 'clone',
            direction: 'all',
            data: null
        });
        this.supr();

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onBodyMouseMove = this._onBodyMouseMove.bind(this);
        this._onBodyMouseUp = this._onBodyMouseUp.bind(this);
    },
    init: function() {
        var inner = _.dom.element(this);
        _.dom.on(inner, 'mousedown', this._onMouseDown);
        this.supr();

        this.$watch('disabled', function(newValue) {
            if(newValue)
                _.dom.delClass(inner, 'z-draggable');
            else
                _.dom.addClass(inner, 'z-draggable');
        });
    },
    _getProxy: function() {
        if(typeof this.data.proxy === 'function')
            return this.data.proxy();
        else if(this.data.proxy instanceof HTMLElement)
            return this.data.proxy;
        else if(this.data.proxy instanceof Draggable.Proxy) {
            var proxy = _.dom.element(this.data.proxy);
            var dimension = _.dom.getDimension(_.dom.element(this));
            this._initProxy(proxy, dimension);
            return proxy;
        } else if(this.data.proxy === 'clone') {
            var proxy = _.dom.element(this);
            var dimension = _.dom.getDimension(proxy);
            proxy = proxy.cloneNode(true);
            this._initProxy(proxy, dimension);
            return proxy;
        } else if(this.data.proxy === 'self') {
            var proxy = _.dom.element(this);
            var dimension = _.dom.getDimension(proxy);
            this._initProxy(proxy, dimension);
            return proxy;
        }
    },
    _initProxy: function(proxy, dimension) {
        proxy.style.left = dimension.left + 'px';
        proxy.style.top = dimension.top + 'px';
        proxy.style.zIndex = '2000';
        proxy.style.position = 'fixed';
        document.body.appendChild(proxy);
    },
    _onMouseDown: function($event) {
        if(this.data.disabled)
            return;
        $event.preventDefault();

        _.dom.on(document.body, 'mousemove', this._onBodyMouseMove);
        _.dom.on(document.body, 'mouseup', this._onBodyMouseUp);
    },
    _onBodyMouseMove: function($event) {
        var e = $event.event;
        $event.preventDefault();

        if(dragDrop.dragging === false) {
            _.extend(dragDrop, {
                dragging: true,
                data: this.data.data,
                proxy: this._getProxy(),
                screenX: e.screenX,
                screenY: e.screenY,
                movementX: 0,
                movementY: 0,
                droppable: undefined
            }, true);

            if(dragDrop.proxy)
                _.dom.addClass(dragDrop.proxy, 'z-dragging');

            this.$emit('dragstart', {
                origin: this,
                source: this,
                target: dragDrop.proxy,
                data: dragDrop.data,
                screenX: dragDrop.screenX,
                screenY: dragDrop.screenY,
                movementX: dragDrop.movementX,
                movementY: dragDrop.movementY
            });
        } else {
            dragDrop.movementX = e.screenX - dragDrop.screenX;
            dragDrop.movementY = e.screenY - dragDrop.screenY;
            dragDrop.screenX = e.screenX;
            dragDrop.screenY = e.screenY;

            if(dragDrop.proxy) {
                if(this.data.direction === 'all' || this.data.direction === 'horizontal')
                    dragDrop.proxy.style.left = dragDrop.proxy.offsetLeft + dragDrop.movementX + 'px';
                if(this.data.direction === 'all' || this.data.direction === 'vertical')
                    dragDrop.proxy.style.top = dragDrop.proxy.offsetTop + dragDrop.movementY + 'px';
            }

            this.$emit('drag', {
                origin: this,
                source: this,
                target: dragDrop.proxy,
                data: this.data.data,
                screenX: dragDrop.screenX,
                screenY: dragDrop.screenY,
                movementX: dragDrop.movementX,
                movementY: dragDrop.movementY
            });

            // Drop
            dragDrop.proxy.style.display = 'none';
            var pointElement = document.elementFromPoint(e.clientX, e.clientY);
            dragDrop.proxy.style.display = '';

            var pointDroppable = dragDrop.droppables.find(function(droppable) {
                return _.dom.element(droppable) === pointElement;
            });

            if(dragDrop.droppable !== pointDroppable) {
                pointDroppable && pointDroppable.$emit('dragenter', {
                    origin: this,
                    source: pointDroppable,
                    target: pointElement,
                    data: this.data.data,
                    screenX: dragDrop.screenX,
                    screenY: dragDrop.screenY,
                    movementX: dragDrop.movementX,
                    movementY: dragDrop.movementY
                });
                dragDrop.droppable && dragDrop.droppable.$emit('dragleave', {
                    origin: this,
                    source: dragDrop.droppable,
                    target: undefined,
                    data: this.data.data,
                    screenX: dragDrop.screenX,
                    screenY: dragDrop.screenY,
                    movementX: dragDrop.movementX,
                    movementY: dragDrop.movementY
                });

                dragDrop.droppable = pointDroppable;
            } else {
                pointDroppable && pointDroppable.$emit('dragover', {
                    origin: this,
                    source: pointDroppable,
                    target: pointElement,
                    data: this.data.data,
                    screenX: dragDrop.screenX,
                    screenY: dragDrop.screenY,
                    movementX: dragDrop.movementX,
                    movementY: dragDrop.movementY
                });
            }
        }
    },
    _onBodyMouseUp: function($event) {
        $event.preventDefault();

        if(dragDrop.droppable) {
            dragDrop.droppable.data.data = this.data.data;
            dragDrop.droppable.$update();

            dragDrop.droppable.$emit('drop', {
                origin: this,
                source: dragDrop.droppable,
                target: _.dom.element(dragDrop.droppable),
                data: this.data.data,
                screenX: dragDrop.screenX,
                screenY: dragDrop.screenY,
                movementX: 0,
                movementY: 0
            });
        }

        this.$emit('dragend', {
            origin: this,
            source: this,
            target: undefined
        });

        if(dragDrop.proxy) {
            if(this.data.proxy instanceof Draggable.Proxy || this.data.proxy === 'clone')
                document.body.removeChild(dragDrop.proxy);

            _.dom.delClass(dragDrop.proxy, 'z-dragging');
        }

        this.cancel();
    },
    cancel: function() {
        _.extend(dragDrop, {
            dragging: false,
            data: null,
            proxy: null,
            screenX: 0,
            screenY: 0,
            movementX: 0,
            movementY: 0,
            droppable: undefined
        }, true);

        _.dom.off(document.body, 'mousemove', this._onBodyMouseMove);
        _.dom.off(document.body, 'mouseup', this._onBodyMouseUp);
    }
});

Draggable.Proxy = Regular.extend({
    name: 'draggable.proxy',
    template: '{#inc this.$body}',
    init: function() {
        if(this.$outer instanceof Draggable)
            this.$outer.data.proxy = this;
    }
    // node: _.noop
})

module.exports = Draggable;