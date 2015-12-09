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
 * @param {string|Dragable.Proxy|HTMLElement|function='clone'}  options.data.proxy  @=> 拖拽代理，即拖拽时显示的元素。默认值为`clone`，拖拽时拖起自身的一个拷贝；当值为`self`，拖拽时直接拖起自身。也可以用`<draggable.proxy>`自定义代理，或直接传入一个元素或函数。其他值表示不使用拖拽代理。
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
            data: null,
            attachClass: true
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
            if(this.data.attachClass) {
                if(newValue)
                    _.dom.delClass(inner, 'z-draggable');
                else
                    _.dom.addClass(inner, 'z-draggable');
            }
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
    _initProxy: function(proxy, dimension) {
        proxy.style.left = dimension.left + 'px';
        proxy.style.top = dimension.top + 'px';
        proxy.style.zIndex = '2000';
        proxy.style.position = 'fixed';
        proxy.style.display = '';
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

            // Drop
            dragdrop.proxy.style.display = 'none';
            var pointElement = document.elementFromPoint(e.clientX, e.clientY);
            dragdrop.proxy.style.display = '';

            var pointDroppable = dragdrop.droppables.find(function(droppable) {
                return _.dom.element(droppable) === pointElement;
            });

            if(dragdrop.droppable !== pointDroppable) {
                dragdrop.droppable && this._dragLeave(dragdrop.droppable);
                pointDroppable && this._dragEnter(pointDroppable);
                dragdrop.droppable = pointDroppable;
            } else
                pointDroppable && this._dragOver(pointDroppable);
        }
    },
    _onBodyMouseUp: function($event) {
        var e = $event.event;
        $event.preventDefault();

        dragdrop.droppable && this._drop(dragdrop.droppable);
        this._dragEnd();

        this.cancel();
    },
    cancel: function() {
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
    _dragStart: function(e) {
        if(dragdrop.proxy && this.data.attachClass)
            _.dom.addClass(dragdrop.proxy, 'z-dragging');

        this.$emit('dragstart', _.extend({
            origin: this,
            source: this,
            target: dragdrop.proxy
        }, dragdrop));
    },
    _drag: function() {
        this.$emit('drag', _.extend({
            origin: this,
            source: this,
            target: dragdrop.proxy,
         }, dragdrop));
    },
    _dragEnter: function(droppable) {
        var element = _.dom.element(droppable);
        droppable.data.attachClass && _.dom.addClass(element, 'z-dragover');
        
        droppable.$emit('dragenter', _.extend({
            origin: this,
            source: droppable,
            target: element
        }, dragdrop));
    },
    _dragLeave: function(droppable) {
        var element = _.dom.element(droppable);
        droppable.data.attachClass && _.dom.delClass(element, 'z-dragover');
        
        droppable.$emit('dragleave', _.extend({
            origin: this,
            source: droppable,
            target: element
        }, dragdrop));
    },
    _dragOver: function(droppable) {
        var element = _.dom.element(droppable);
        var dimension = _.dom.getDimension(element);

        droppable.$emit('dragover', _.extend({
            origin: this,
            source: droppable,
            target: element,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height
        }, dragdrop));
    },
    _drop: function(droppable) {
        var element = _.dom.element(droppable);
        droppable.data.attachClass && _.dom.delClass(element, 'z-dragover');
        var dimension = _.dom.getDimension(element);

        droppable.data.data = this.data.data;
        droppable.$update();

        droppable.$emit('drop', _.extend({
            origin: this,
            source: droppable,
            target: element,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height
        }, dragdrop));
    },
    _dragEnd: function() {
        this.$emit('dragend', {
            origin: this,
            source: this,
            target: dragdrop.proxy
        });

        if(dragdrop.proxy) {
            if(this.data.proxy instanceof Draggable.Proxy || this.data.proxy === 'clone')
                dragdrop.proxy.parentElement.removeChild(dragdrop.proxy);

            this.data.attachClass && _.dom.delClass(dragdrop.proxy, 'z-dragging');
        }
    }
});

Draggable.Proxy = Component.extend({
    name: 'draggable.proxy',
    template: '{#inc this.$body}',
    init: function() {
        if(this.$outer instanceof Draggable) {
            _.dom.element(this).style.display = 'none';
            this.$outer.data.proxy = this;
        }
    }
    // node: _.noop
})

module.exports = Draggable;