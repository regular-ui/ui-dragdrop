/**
 * ------------------------------------------------------------
 * Droppable  放置
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('regular-ui-base/src/component');
var _ = require('regular-ui-base/src/_');
var dragdrop = require('./dragdrop.js');

/**
 * @class Droppable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {object}                  options.data.data               <=  拖放后传递过来的数据
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {string='z-droppable'}    options.data.class               => 可放置时（即disabled=false）给元素附加此class
 * @param {string='z-dragover'}     options.data.dragOverClass       => 拖拽该元素上方时给元素附加此class
 */
var Droppable = Component.extend({
    name: 'droppable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            data: null,
            'class': 'z-droppable',
            dragOverClass: 'z-dragover'
        });
        this.supr();

        dragdrop.droppables.push(this);
    },
    /**
     * @protected
     */
    init: function() {
        var inner = _.dom.element(this);
        this.$watch('disabled', function(newValue) {
            if(newValue)
                _.dom.delClass(inner, this.data['class']);
            else
                _.dom.addClass(inner, this.data['class']);
        });
        this.supr();
    },
    /**
     * @protected
     */
    destroy: function() {
        dragdrop.droppables.splice(dragdrop.droppables.indexOf(this), 1);
        this.supr();
    },
    /**
     * @private
     */
    _dragEnter: function(origin) {
        var element = _.dom.element(this);
        _.dom.addClass(element, this.data.dragOverClass);
        
        /**
         * @event dragenter 拖拽进入该元素时触发
         * @property {object} source 事件发起对象，为当前droppable
         * @property {object} target 事件目标对象，为当前接收元素
         * @property {object} origin 事件源，即拖拽源，为拖拽的draggable
         * @property {object} data 拖拽时接收到的数据
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
        this.$emit('dragenter', _.extend({
            source: this,
            target: element,
            origin: origin,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _dragLeave: function(origin) {
        var element = _.dom.element(this);
        _.dom.delClass(element, this.data.dragOverClass);
        
        /**
         * @event dragleave 拖拽离开该元素时触发
         * @property {object} source 事件发起对象，为当前droppable
         * @property {object} target 事件目标对象，为当前接收元素
         * @property {object} origin 事件源，即拖拽源，为拖拽的draggable
         * @property {object} data 拖拽时接收到的数据
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
        this.$emit('dragleave', _.extend({
            source: this,
            target: element,
            origin: origin,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _dragOver: function(origin) {
        var element = _.dom.element(this);
        var dimension = _.dom.getDimension(element);

        /**
         * @event dragover 拖拽在该元素上方时触发
         * @property {object} source 事件发起对象，为当前droppable
         * @property {object} target 事件目标对象，为当前接收元素
         * @property {object} origin 事件源，即拖拽源，为拖拽的draggable
         * @property {object} data 拖拽时接收到的数据
         * @property {number} ratioX 鼠标指针相对于接收元素所占的长度比
         * @property {number} ratioY 鼠标指针相对于接收元素所占的高度比
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
        this.$emit('dragover', _.extend({
            source: this,
            target: element,
            origin: origin,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _drop: function(origin) {
        var element = _.dom.element(this);
        _.dom.delClass(element, this.data.dragOverClass);
        var dimension = _.dom.getDimension(element);

        this.data.data = origin.data.data;
        this.$update();

        /**
         * @event drop 拖拽放置时触发
         * @property {object} source 事件发起对象，为当前droppable
         * @property {object} target 事件目标对象，为当前接收元素
         * @property {object} origin 事件源，即拖拽源，为拖拽的draggable
         * @property {object} data 拖拽时接收到的数据
         * @property {number} ratioX 鼠标指针相对于接收元素所占的长度比
         * @property {number} ratioY 鼠标指针相对于接收元素所占的高度比
         * @property {number} screenX 鼠标指针相对于屏幕的水平位置
         * @property {number} screenY 鼠标指针相对于屏幕的垂直位置
         * @property {number} clientX 鼠标指针相对于浏览器的水平位置
         * @property {number} clientY 鼠标指针相对于浏览器的垂直位置
         * @property {number} pageX 鼠标指针相对于页面的水平位置
         * @property {number} pageY 鼠标指针相对于页面的垂直位置
         * @property {number} movementX 鼠标指针水平位置相对于上次操作的偏移量
         * @property {number} movementY 鼠标指针垂直位置相对于上次操作的偏移量
         */
        this.$emit('drop', _.extend({
            source: this,
            target: element,
            origin: origin,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height
        }, dragdrop));
    }
});

module.exports = Droppable;