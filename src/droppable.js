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
            attachClass: true
        });
        this.supr();

        dragdrop.droppables.push(this);
    },
    init: function() {
        var inner = _.dom.element(this);
        this.$watch('disabled', function(newValue) {
            if(this.data.attachClass) {
                if(newValue)
                    _.dom.delClass(inner, 'z-droppable');
                else
                    _.dom.addClass(inner, 'z-droppable');
            }
        });
        this.supr();
    },
    destroy: function() {
        dragdrop.droppables.splice(dragdrop.droppables.indexOf(this), 1);
        this.supr();
    }
});

module.exports = Droppable;