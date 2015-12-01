/**
 * ------------------------------------------------------------
 * Droppable  放置
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('regular-ui-base/src/component');
var _ = require('regular-ui-base/src/_');
var dragDrop = require('./dragDrop.js');

/**
 * @class Droppable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {object}                  options.data.effect              => 效果（与浏览器的dropEffect一致）。可选的值有`none`、`copy`、`move`、`link`。
 * @param {object}                  options.data.data               <=  拖放后传递过来的数据
 * @param {boolean=false}           options.data.disabled            => 是否禁用
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
        });
        this.supr();

        dragDrop.droppables.push(this);
    },
    init: function() {
        var inner = _.dom.element(this);
        this.$watch('disabled', function(newValue) {
            if(newValue)
                _.dom.delClass(inner, 'z-droppable');
            else
                _.dom.addClass(inner, 'z-droppable');
        });
        this.supr();
    }
});

module.exports = Droppable;