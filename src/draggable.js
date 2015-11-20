/**
 * ------------------------------------------------------------
 * Draggable  拖拽
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var _ = require('regular-ui-base/src/_');
var dragDrop = require('./dragDrop.js');

var isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;

/**
 * @class Draggable
 * @extend Regular
 * @param {object}                  options.data                     =  绑定属性
 * @param {string|Dragable.Image|function='auto'}  options.data.image  @=> 拖拽时的图像。值为`auto`拖拽时，复制一个拖拽元素的图像（浏览器的默认设置），值为`empty`拖拽时不显示图像，可以用`<draggable.image>`自定义图像。也可以直接传入一个函数，要求返回{image: 图像元素, x: 横向偏移, y: 纵向偏移}。
 * @param {string}                  options.data.effect              => 效果（与浏览器的effectAllowed一致）。可选的值有`none`、`uninitialized`、`all`、`copy`、`move`、`link`、`copyLink`、`copyMove`、`linkMove`。
 * @param {object}                  options.data.data                => 拖拽时需要传递的数据
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 */
var Draggable = Regular.extend({
    name: 'draggable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            image: 'auto',
            effect: undefined,
            data: null,
            disabled: false
        });
        this.supr();
    },
    init: function() {
        // 修改内部DOM元素
        var inner = _.dom.element(this);
        _.dom.on(inner, 'dragstart', this._onDragStart.bind(this));
        _.dom.on(inner, 'drag', this._onDrag.bind(this));
        _.dom.on(inner, 'dragend', this._onDragEnd.bind(this));

        this._onDragOverDocument = this._onDragOverDocument.bind(this);

        this.$watch('disabled', function(newValue) {
            inner.draggable = !newValue;

            if(newValue)
                _.dom.delClass(inner, 'z-draggable');
            else
                _.dom.addClass(inner, 'z-draggable');

        });
        this.supr();
    },
    _getImageData: function() {
        if(typeof this.data.image === 'function')
            return this.data.image();
        else if(this.data.image instanceof Draggable.Image) {
            var image = _.dom.element(this.data.image);
            return {
                image: image,
                x: this.data.image.data.x,
                y: this.data.image.data.y,
                appendToBody: true
            };
        } else if(this.data.image === 'empty') {
            var empty = document.createElement('span');
            empty.innerHTML = '&nbsp;';
            empty.style.position = 'fixed';
            return {
                image: empty,
                x: 0, y: 0,
                appendToBody: true
            };
        } else if(this.data.image === 'auto')
            return null;
    },
    _onDragStart: function($event) {
        var e = $event.event;

        // 处理DataTransfer
        // IE低版本没有这个属性
        if(e.dataTransfer) {
            var imageData = this._getImageData();
            if(imageData) {
                imageData.appendToBody && document.body.appendChild(imageData.image);
                e.dataTransfer.setDragImage(imageData.image, imageData.x, imageData.y);
            }

            if(this.data.effect)
                e.dataTransfer.effectAllowed = this.data.effect;

            // Firefox必须设置这个东西
            e.dataTransfer.setData('text', '');
        }

        dragDrop.data = this.data.data;
        dragDrop.cancel = false;
        dragDrop.movementX = 0;
        dragDrop.movementY = 0;
        dragDrop.screenX = e.screenX;
        dragDrop.screenY = e.screenY;
        dragDrop.imageData = imageData;

        isFirefox && _.dom.on(document.body, 'dragover', this._onDragOverDocument);

        // emit事件
        var eventData = _.extend(_.extend({
            data: dragDrop.data
        }, $event), e);
        this.$emit('dragstart', eventData);

        _.dom.addClass(e.target, 'z-dragging');
    },
    _onDrag: function($event) {
        var e = $event.event;

        // 拖拽结束时会监听到一个都为0的事件
        if(e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0)
            return;

        dragDrop.movementX = e.screenX - dragDrop.screenX;
        dragDrop.movementY = e.screenY - dragDrop.screenY;
        dragDrop.screenX = e.screenX;
        dragDrop.screenY = e.screenY;

        // emit事件
        var eventData = _.extend(_.extend({
            data: dragDrop.data,
            movementX: dragDrop.movementX,
            movementY: dragDrop.movementY
        }, $event), e);
        this.$emit('drag', eventData);
    },
    _onDragEnd: function($event) {
        var e = $event.event;

        isFirefox && _.dom.off(document.body, 'dragover', this._onDragOverDocument);

        _.dom.delClass(e.target, 'z-dragging');
        if(dragDrop.imageData && dragDrop.imageData.appendToBody)
            document.body.removeChild(dragDrop.imageData.image);

        dragDrop.data = null;
        dragDrop.cancel = false;
        dragDrop.imageData = null;

        var eventData = _.extend(_.extend({}, $event), e);
        this.$emit('dragend', eventData);
    },
    // For FireFox
    _onDragOverDocument: function($event) {
        var e = $event.event;

        // 拖拽结束时会监听到一个都为0的事件
        if(e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0)
            return;

        dragDrop.movementX = e.screenX - dragDrop.screenX;
        dragDrop.movementY = e.screenY - dragDrop.screenY;
        dragDrop.screenX = e.screenX;
        dragDrop.screenY = e.screenY;

        // emit事件
        var eventData = _.extend(_.extend({
            data: dragDrop.data,
            movementX: dragDrop.movementX,
            movementY: dragDrop.movementY
        }, $event), e);
        this.$emit('drag', eventData);
    }
});

Draggable.Image = Regular.extend({
    name: 'draggable.image',
    template: '{#inc this.$body}',
    config: function() {
        _.extend(this.data, {
            x: 0,
            y: 0
        });
        this.supr();
    },
    init: function() {
        var image = _.dom.element(this);
        image.style.position = 'fixed';
        if(this.$outer instanceof Draggable)
            this.$outer.data.image = this;
    }
})

module.exports = Draggable;