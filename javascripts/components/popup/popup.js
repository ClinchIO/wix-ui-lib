jQuery.fn.definePlugin('Popup', function ($) {
	'use strict';
	
	var names = {};
	
	var buttonSet = {
		okCancel: '<button class="uilib-btn btn-secondary btn-small x-close-popup">Cancel</button><button style="float:right" class="uilib-btn btn-small close-popup">OK</button>',
		none: ''
	};
	
	return {
		init: function(){
			// TODO: get rid of this.popup	
			this.state = 'open';
			this.popup = this.$el[0]; 
			this.transclude();
			this.markup();
			this.close();
			this.setContent(this.options.content);
			this.setFooter(this.options.footer);
			this.setTitle(this.options.title);
			this.setPosition();
			this.bindEvents();
		},
		getDefaults: function(){
			return {
				appendTo: 'body',
				title : 'Popup',
				content : '',
				footer : '',
				modal : false,
				modalBackground : 'rgba(0,0,0,0.5)',
				height : 'auto',
				width : 300,
				buttonSet: '',
				onclose : function () {},
				oncancel: function() {},
				onopen: function(){},
				onposition: function(){}				
			};
		},
		markup: function () {
			this.modal = document.createElement('div');
			this.header = document.createElement('header');
			this.headerTitle = document.createElement('span');
			this.closeBtn = document.createElement('div');

			this.content = document.createElement('div');

			this.footer = document.createElement('div');

			this.modal.className = 'popup-modal';

			this.closeBtn.className = 'popup-close-btn x-close-popup';
			this.popup.className = 'popup';
			this.header.className = 'popup-header';
			this.content.className = 'popup-content';
			this.footer.className = 'popup-footer';
			
			this.popup.appendChild(this.header);
			this.popup.appendChild(this.content);
			this.popup.appendChild(this.footer);
			this.header.appendChild(this.headerTitle);
			this.header.appendChild(this.closeBtn);
			
			this.arrow = this.createArrowElement();
		},
		transclude: function () {
			var $el = this.$el;
			$el.remove();
			var headerContent = $el.find('.popup-header').text();
			var contentContent = $el.find('.popup-content').html();
			var footerContent = $el.find('.popup-footer').html();
			if($.trim(headerContent)){
				this.options.title = headerContent;
			}
			if($.trim(contentContent)){
				this.options.content = contentContent;
			}
			if($.trim(footerContent)){
				this.options.footer = footerContent;
			}
			$el.empty();
		},
		bindEvents: function () {
			var popup = this;
			var closeHandler = function (type) {
				popup.setValue('close');
				var onType = popup.options['on' + type];
				if(typeof onType === 'string' && typeof window[onType] === 'function'){
					window[onType].call(popup, {type: type});
				} else if(typeof onType === 'function'){
					onType.call(popup, {type: type});
				}			
			}
			var globalCloseHandler = function(evt){
				var popupEl = $(evt.target).parents('.popup')[0];
				if(popupEl && popupEl === popup.popup || !popup.isOpen()){
					return ;
				}else if(!popup.options.modal){
					popup.setValue('close');
					closeHandler('cancel');
				}
			}
			
			$(this.popup).on('click', '.close-popup', closeHandler.bind(null, 'close'));
			$(this.popup).on('click', '.x-close-popup', closeHandler.bind(null, 'cancel'));
			$(window).on('click', globalCloseHandler);
			
			this.whenDestroy(function(){
				$(window).off('click', globalCloseHandler);
			});
			
		},
		getValue: function () {
			return this.isOpen();
		},
		setValue: function (value) {
			if(value === 'open'){
				this.open();
			} else {
				this.close();
			}
			this.triggerChangeEvent('close');
		},
		setRelativeElement: function(selectorOrElement){
			this.relativeElement = $(selectorOrElement)[0];
		},
		setPosition: function () {
			this.$el.css({
				position : 'absolute',
				width : this.options.width,
				height : this.options.height,
				left : '50%',
				top : '50%',
				marginLeft : 0 - this.options.width / 2,
				marginTop : 0 - this.$el.height() / 2
			});
			if(this.relativeElement){
				this.setBestPosition(this.relativeElement);
			}
			if(typeof this.options.onposition === 'function'){
				return this.options.onposition.call(this);
			}
		},
		setBestPosition: function(relativeTo){
			if(relativeTo instanceof jQuery){
				relativeTo = relativeTo[0];
			}
			var dir = setBestPosition(this.$el[0], relativeTo);
			this.setArrowDir(dir);
			return dir;
		},
		createArrowElement: function(){
			return createArrowElement();
		},
		setArrowDir: function(side){
			side = side||'left';
			return this.arrow.className = 'popup-arrow popup-arrow-' + side;
		},
		setContent: function (content) {
			$(this.content).empty().append(content);
		},
		setFooter: function (footerContent) {
			$(this.footer).empty().append(buttonSet[this.options.buttonSet], footerContent);
		},
		setTitle: function (title) {
			$(this.headerTitle).text(title);
		},
		isOpen: function (title) {
			return this.state === 'open';
		},
		toggle: function(){
			this.isOpen() ? this.close() : this.open();
		},
		open: function () {
			if(this.isOpen()){return;}
			this.state = 'open';
			setTimeout(function(){
				if(this.options.modal){
					document.body.appendChild(this.modal);
				}
				$(this.options.appendTo).append(this.popup);
				this.popup.style.display = 'block';
				this.modal.style.display = 'block';
				this.arrow.style.display = 'block';
				this.modal.style.backgroundColor = this.options.modalBackground;
				this.setPosition();
				if(this.options.onopen){
					return this.options.onopen.call(this);
				}
			}.bind(this),0);
		},
		close: function () {
			if(!this.isOpen()){return;}
			this.state = 'close';
			setTimeout(function(){
				this.modal.style.display = 'none';
				this.popup.style.display = 'none';
				this.arrow.style.display = 'none';
			}.bind(this),0);
		}
	};
	
	function createArrowElement(side){
		side = side || 'left';
		var wrapperArrow = document.createElement('div');
		var a1 = document.createElement('div');
		var a2 = document.createElement('div');
		wrapperArrow.className = 'popup-arrow popup-arrow-' + side;
		a1.className = 'popup-arrow-one';
		a2.className = 'popup-arrow-two';
		wrapperArrow.appendChild(a1);
		wrapperArrow.appendChild(a2);	
		return wrapperArrow;
	}
	
	function setBestPosition(targetNode, relativeTo){
		var side = 'left';
		var right = 'auto';
		var distanceFromBox = 15;
		var topMoveTranslate = 0;
		
		targetNode.style.top = '0px';
		targetNode.style.bottom = 'auto';
 		targetNode.style.left = '0px';
		targetNode.style.right = 'auto';
		targetNode.style.margin = '0';
	
		var targetNodeWidth = targetNode.clientWidth;
		var targetNodeHeight = targetNode.clientHeight;
		var halfTargetNodeHeight = targetNodeHeight/2;
		
		var elmWidth = relativeTo.clientWidth;
		var elmHeight = relativeTo.clientHeight;

		var top = (elmHeight/2 - halfTargetNodeHeight);
		var left = elmWidth + distanceFromBox;
		

		var offset = getOffset(relativeTo);
		
		if((elmWidth + targetNodeWidth + offset.left + distanceFromBox + 1) > window.innerWidth){
			right = elmWidth + distanceFromBox + 1;
			side = 'right';
		}

			
		var rightOver = (offset.left - (targetNodeWidth + distanceFromBox + 1));
		if(side === 'right' && rightOver < 0){
			top = 0 - (targetNodeHeight + distanceFromBox);
			right = elmWidth/2 - targetNodeWidth/2;
			side = 'top';
		}

	
		if((offset.top - halfTargetNodeHeight) < 0){
			top -= offset.top - halfTargetNodeHeight - topMoveTranslate;
		}
		
		if(side !== 'top' && (elmHeight + offset.top + halfTargetNodeHeight) > window.innerHeight){
			top -= (elmHeight + offset.top + halfTargetNodeHeight) - window.innerHeight;
		}
		
		targetNode.style.top = top + 'px';
		targetNode.style.left = (side === 'right' || side === 'top') ? 'auto' : left + 'px';
		targetNode.style.right = (side === 'right' || side === 'top') ? right + 'px' : 'auto';
		targetNode.style.margin = '';
		return side;

	}			
	function getOffset(el) {
		var _x = 0;
		var _y = 0;
		while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
			if(el === document.body){
				_x += el.offsetLeft - document.documentElement.scrollLeft;
				_y += el.offsetTop - document.documentElement.scrollTop;
			} else {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
			}
			el = el.offsetParent;
		}
		return { top: _y, left: _x };
	}
	
	
});
