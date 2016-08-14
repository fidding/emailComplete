/*
 * jquery.emailComplete.js - jQuery Plugin for Email Complete
 *
 * Version: v2.1.1
 *
 * Author: fidding
 * blog: http://www.fidding.me/
 * github: https://github.com/fidding/
 * email: 395455856@qq.com
 *
 * Licensed like jQuery, see http://docs.jquery.com/License
 *
 * Build: 2016-08-08
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function ($) {
    'use strict';

	$.fn.emailComplete = function (options) {
		return this.each(function (e) {
			var _this = $(this);
            var _parent = $(this).parent();
			email.opts = $.extend({}, options, $.fn.emailComplete.defaults);// integration config
            email.obj = _this;
			email.init();// init email

			$(window).resize(function () {
				email.setPos(email.getPos());
			});
            // input event
			_this.on('input', function (e) {
				if(_this.val() == ''){
					email.hidden();
				}else{
					email.onInput(e);
				}
			});
            // keyup event
			_this.on('keyup', function (e) {
				if(_this.val() == ''){
					email.hidden();
				}else{
					email.onKeyup(e);
				}
			});
            // focus event
			_this.on('focus', function () {
				email.onFocus($(this));
			});
            // blur event
			_this.on('blur', function () {
				email.onBlur();
			});
            // item mouse event
            _parent.on('mouseover', '.complete-item', function(e){
				email.onMouseOver($(this));
			});
            // item mouse event
			_parent.on('mousedown', '.complete-item', function(e){
				email.onMouseDown($(this));
			});
            // prevent form submit
            email.preventForm();

		});
	}

	var email = {
        opts: {},// config
		obj : null,// email obj
		container : null,// email container
		containerItem : null,// email container item
		active : -1,// active item index
        // init
		init : function () {
            var _this = this;
			_this.obj.after('<div class="complete-container" style="border-radius:'+_this.opts.borderRadius+'px;opacity:'+_this.opts.opacity+'"></div>');
			_this.container = $('.complete-container');
			_this.containerItem = this.container.find('div.complete-item');
			_this.setPos(_this.getPos());// set position
		},
        // item active
        addActive: function (item) {
            item.addClass('complete-active');
        },
        // remove item active
        removeActive: function (item) {
            item.removeClass('complete-active');
        },
        // get email position
		getPos : function () {
            var _this = this;
			var width = _this.obj.outerWidth(),
			    height = _this.obj.outerHeight(),
			    top = _this.obj.position().top+height+3,
			    left = _this.obj.position().left;
			return { top:top , left:left, width:width };
		},
        // set email position
		setPos : function(data){
            var _this = this;
			_this.container.css({ top:data.top,left:data.left,width:data.width });
		},
        // show email container
		show : function(){
            var _this = this;
			_this.container.css({'visibility':'visible'});
		},
        // hidden email container
		hidden : function(){
            var _this = this;
			_this.container.css({'visibility':'hidden'});
			_this.active = -1;
		},
        // email text change
		onInput : function(e){
            var _this = this;
			_this.active = -1;
			_this.container.empty();
			var completeItem ='';
			var index = _this.obj.val().indexOf('@');// weather has @
			if(index != -1){// has @
				var startVal = _this.obj.val().substring(0, index);// get the string before @
				var endVal = _this.obj.val().substring(index+1,this.obj.val().length);// get the string after @
				if(endVal == ''){
                    //add all opts.data
					$.each(_this.opts.data, function (n, value) {
						completeItem += '<div class="complete-item">'+startVal+'@'+value+'</div>';
					});
				}else{
					var isHas = 0;
					$.each(_this.opts.data, function (n, value) {
						if(value.indexOf(endVal) == 0){// there are compliant mail suffix
							var itemContent = startVal+'@'+value;
							if(isHas == 0){
								completeItem += '<div class="complete-item complete-active" >'+itemContent+'</div>';
								email.active = 0;
							}else{
								completeItem += '<div class="complete-item" >'+itemContent+'</div>';
							}
							isHas++;
						}
					});
					if(isHas == 0){// if no compliant mail suffix to hide email container
						email.hidden();
						return true;
					}
				}
			}else{// no @
				$.each(_this.opts.data, function (n,value) {
					completeItem += '<div class="complete-item">'+_this.obj.val()+'@'+value+'</div>';
				});
			}
			_this.container.append(completeItem);
			_this.containerItem = _this.container.find('div.complete-item');
			_this.show();// show email
		},
        // keyboard operation event
		onKeyup : function (e) {
            var _this = this;
			if(_this.container.is(':visible')){
				var itemLength = _this.containerItem.length;
				switch (e.keyCode) {
				case 13||10 :// enter
					if(_this.active == -1){
					}else{
						_this.obj.val(_this.containerItem.eq(_this.active).html());
						_this.hidden();
						_this.onCallBack();
					}
					break;
				case 38 :// up arrow
					if(_this.active == -1){
                        _this.addActive(_this.containerItem.eq(itemLength-1));
						_this.active = itemLength-1;
					}else{
						if(_this.active-1 < 0){
                            _this.removeActive(_this.containerItem.eq(_this.active));
							_this.active = -1;
						}else{
                            _this.removeActive(_this.containerItem.eq(_this.active));
                            _this.addActive(_this.containerItem.eq(_this.active-1));
							_this.active--;
						}
					}
					break;
				case 40 :// down arrow
					if(this.active == -1){
                        _this.addActive(_this.containerItem.eq(0));
						_this.active = 0;
					}else{
                        _this.removeActive(_this.containerItem.eq(_this.active));
						if(_this.active+1 == itemLength){
							_this.active = -1;
						}else{
                            _this.addActive(_this.containerItem.eq(_this.active+1));
							_this.active++;
						}
					}
					break;
				case 27 :// esc
					_this.hidden();
					break;
				default :
					break;
				}
			}
		},
        // email input blur event
		onBlur : function(){
            var _this = this;
			_this.active = -1;
			_this.container.remove();
		},
        // email input focus event
		onFocus : function(obj){
            var _this = this;
			_this.obj = obj;//重新指定obj
			if(_this.container.length){
				_this.container.remove();
			}
			_this.init();
		},
        // item hover event
		onMouseOver : function(obj){
            var _this = this;
			_this.containerItem.each(function(e){
                _this.removeActive($(this));
			});
            _this.addActive(obj);
			_this.active = obj.index();
		},
        // item hover down event
		onMouseDown : function(obj){
            var _this = this;
			_this.obj.val(obj.html());
			_this.hidden();
			_this.onCallBack();
		},
        // callback function
		onCallBack : function(){
            var _this = this;
			if(typeof _this.opts.callback == 'function'){
				_this.opts.callback();
			}else{
				console.log(_this.opts.callback);
			}
		},
        // prevent form submit function
        preventForm: function () {
            var _this = this;
			if($('form').length){ // has form table
				$('form').submit(function(value){
					if(_this.active != -1){
						_this.obj.val(_this.containerItem.eq(_this.active).html());
						_this.hidden();
						_this.onCallBack();//回车执行回调
						return false;
					}
				});
			}
        },
	}

    /**
     * [plugin defaults config]
     */
	$.fn.emailComplete.defaults = {
		opacity : 1, // email container opacity
		borderRadius: 0, // email container border-radius (px)
		data : ['qq.com','163.com','126.com','sina.com','sohu.com'], // email suffix
		callback : $.noop // callback
	}
})
