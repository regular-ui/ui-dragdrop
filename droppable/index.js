import {Component, util as _} from 'regular-ui-base';
import dragdrop from '../dragdrop';

/**
 * @class Droppable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {var}                     options.data.value              <=  拖放后传递过来的值
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {string='z-droppable'}    options.data.class               => 可放置时（即disabled=false）给元素附加此class
 * @param {string='z-dragover'}     options.data.dragOverClass       => 拖拽该元素上方时给元素附加此class
 */
let Droppable = Component.extend({
    name: 'droppable',
    template: '{#inc this.$body}',
    /**
     * @protected
     */
    config() {
        this.data = Object.assign({
            data: null,
            'class': 'z-droppable',
            dragOverClass: 'z-dragover'
        }, this.data);
        this.supr();

        dragdrop.droppables.push(this);
    },
    /**
     * @protected
     */
    init() {
        let inner = _.dom.element(this);
        this.$watch('disabled', (newValue) =>
            _.dom[newValue ? 'delClass' : 'addClass'](inner, this.data['class']));
        this.supr();
    },
    /**
     * @protected
     */
    destroy() {
        dragdrop.droppables.splice(dragdrop.droppables.indexOf(this), 1);
        this.supr();
    },
    /**
     * @private
     */
    _dragEnter(origin) {
        let element = _.dom.element(this);
        _.dom.addClass(element, this.data.dragOverClass);

        /**
         * @event dragenter 拖拽进入该元素时触发
         * @property {object} sender 事件发送对象，为当前droppable
         * @property {object} origin 拖拽源，为拖拽的draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {object} target 拖拽目标元素
         * @property {object} value 拖拽时接收到的值
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
        this.$emit('dragenter', Object.assign({
            sender: this,
            origin: origin,
            source: _.dom.element(origin),
            target: element,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _dragLeave(origin) {
        let element = _.dom.element(this);
        _.dom.delClass(element, this.data.dragOverClass);

        /**
         * @event dragleave 拖拽离开该元素时触发
         * @property {object} sender 事件发送对象，为当前droppable
         * @property {object} origin 拖拽源，为拖拽的draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {object} target 拖拽目标元素
         * @property {object} value 拖拽时接收到的值
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
        this.$emit('dragleave', Object.assign({
            sender: this,
            origin: origin,
            source: _.dom.element(origin),
            target: element,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _dragOver(origin) {
        let element = _.dom.element(this);
        let dimension = _.dom.getDimension(element);

        /**
         * @event dragover 拖拽在该元素上方时触发
         * @property {object} sender 事件发送对象，为当前droppable
         * @property {object} origin 拖拽源，为拖拽的draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {object} target 拖拽目标元素
         * @property {object} value 拖拽时接收到的值
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
        this.$emit('dragover', Object.assign({
            sender: this,
            origin: origin,
            source: _.dom.element(origin),
            target: element,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height,
            cancel: origin.cancel
        }, dragdrop));
    },
    /**
     * @private
     */
    _drop(origin) {
        let element = _.dom.element(this);
        _.dom.delClass(element, this.data.dragOverClass);
        let dimension = _.dom.getDimension(element);

        this.data.value = origin.data.value;
        this.$update();

        /**
         * @event drop 拖拽放置时触发
         * @property {object} sender 事件发送对象，为当前droppable
         * @property {object} origin 拖拽源，为拖拽的draggable
         * @property {object} source 拖拽起始元素
         * @property {object} proxy 拖拽代理元素
         * @property {object} target 拖拽目标元素
         * @property {object} value 拖拽时接收到的值
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
        this.$emit('drop', Object.assign({
            sender: this,
            origin: origin,
            source: _.dom.element(origin),
            target: element,
            ratioX: (dragdrop.clientX - dimension.left)/dimension.width,
            ratioY: (dragdrop.clientY - dimension.top)/dimension.height
        }, dragdrop));
    }
});

export default Droppable;
