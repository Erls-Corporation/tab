/*
---
script: Tabs.Plugins.Random.js
license: MIT-style license.
description: Random - Provide random multiple effetcs like the barack slideshow.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.3.6: 
  - Tab
provides: [Tab.plugins.Random]
...
*/

(function () {

	var transitions = {
	
		slideIn: function (curTab, newTab, f) {
		
			//curTab.setStyle('z-index', 0);
			newTab.setStyles({zIndex: 1, display: 'block', opacity: 0});
			
			var morph = {opacity: 1}, 
				l = 'offsetWidth', 
				t = 'offsetHeight';
			
			switch(f) {
			
				case 'left' :
						morph.left = [-newTab[l], 0];
						morph.top = 0;
						break;
				case 'top' :
						morph.left = 0
						morph.top = [-newTab[t], 0]
						break;
				case 'right' :
						morph.left = [newTab[l], 0]
						morph.top = 0
						break;
				default :
						morph.left = 0
						morph.top = [newTab[t], 0]
						break;
			}
			
			newTab.morph(morph).get('morph').chain(function () { curTab.setStyle('display', 'none'); newTab.setStyle('z-index', 0) });
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
		},
		slideOut: function (curTab, newTab, f) {
		
			curTab.setStyle('z-index', 1);
			newTab.setStyles({zIndex: 0, display: 'block', opacity: 1, left: 0, top: 0});
			
			var morph = {opacity: 0}, 
				l = 'offsetWidth', 
				t = 'offsetHeight';
			
			switch(f) {
			
				case 'left' :
						morph.left = [0, -curTab[l]];
						morph.top = 0;
						break;
				case 'top' :
						morph.left = 0
						morph.top = [0, -curTab[t]]
						break;
				case 'right' :
						morph.left = [0, curTab[l]]
						morph.top = 0
						break;
				default :
						morph.left = 0
						morph.top = [0, curTab[t]]
						break;
			}
			
			curTab.morph(morph).get('morph');
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
		},
		fade: function (curTab, newTab) {
			
			if (curTab) {
				
				curTab.setStyles({zIndex: 0, left: 0, top: 0});
							
				newTab.setStyles({display: 'block', opacity: 0, zIndex:1, left: 0, top: 0}).
										morph({opacity: 1}).get('morph').chain(function () {
						
								curTab.setStyles({opacity: 0, display: 'none'});
								newTab.setStyle('z-index', 0)
							})
			}
								
			else newTab.set({styles:{display: 'block'}}).morph({opacity: [.5, 1]})
			
			var morph = {height: newTab.offsetHeight, width: newTab.offsetWidth}
			this.container.morph(morph)
		},
		move: function (curTab, newTab, f) {
			
			if(curTab) {
			
				var obj = [],
					options = this.options,
					opacity = options.opacity || .7,
					property = ['top', 'bottom'].indexOf(f) != -1 ? 'offsetHeight' : 'offsetWidth',
					offset = curTab[property],
					l = [curTab, newTab],
					props,
					morph;
				
				if(['left', 'top'].indexOf(f) != -1) offset = -offset;
				
				newTab.setStyles({display: 'block', opacity: 1});
				
				switch(f) {
				
					//right to left
					case 'left':
									props = {left:curTab.offsetLeft - newTab.offsetWidth , top: curTab.offsetTop};
									break;
					//top to bottom
					case 'top':
									props = {top: curTab.offsetTop - curTab.offsetHeight, left: curTab.offsetLeft};
									break
					//right to left
					case 'right':
									props = {left: curTab.offsetLeft + newTab.offsetWidth, top: curTab.offsetTop};
									break
					//bottom to top
					case 'bottom':
									props = {top: curTab.offsetTop + curTab.offsetHeight, left: curTab.offsetLeft};
									break
				}
				
				newTab.setStyles(props);
				
				if(property == 'offsetHeight') l.each(function (p, index) {
					
						obj[index] = {opacity: [opacity, 1], top: [p.offsetTop, p.offsetTop - offset]}
					});
					
				else l.each(function (p, index) {
					
						obj[index] = {opacity: [opacity, 1], left: [p.offsetLeft, p.offsetLeft - offset]}
					});
				
				if(!options.useOpacity) $each(obj, function (k) { delete k.opacity });
			
				l.each(function (p, index) {
				
					p.morph(obj[index]);
					
					if(index == 1) p.get('morph').chain(function () {
					
						l[0].setStyles({display: 'none', left: 0, top: 0})
					})
				})
				
			} else 	newTab.setStyles({opacity: 1, display: 'block'});
			
			morph = {height: newTab.offsetHeight, width: newTab.offsetWidth}
			this.container.morph(morph)
		}
	};
	
	Tab.prototype.plugins.Random = new Class({
		options: {
			/*
				useOpacity: false,
				opacity: .7,
				random: false,
				transitions: ['fade', 'move', 'slideIn', 'slideOut'],
			*/
				directions: ['left', 'right', 'top', 'bottom']
			},
		fx: {
		
			link: 'chain',
			duration: 1000
		},
		transitions: {},
		initialize: function(panels, options, fx) {
		
			fx = $merge(this.fx, fx);
					
			options = this.addTransition(transitions).options = $merge(this.options, options);
			options.directions = $splat(this.options.directions);
			
			var tr = $splat(this.options.transitions || $H(this.transitions).getKeys());
			
			this.options.transitions = [];
			
			tr.each(function (v) { 
				if(v != 'fade') this.options.directions.each(function (d) { options.transitions.push(v + '-' + d) });
				else options.transitions.push(v)
			}, this);
			
			this.panels = panels;
			
			panels.each(function (el) {
			
				el.set({
						styles: {
						
							position: 'absolute',
							zIndex: 0,
							display: 'none'
						},
						morph: fx
					})
			});
			
			var panel = panels[0];
			
			this.container = panel.setStyle('display', 'block').getParent().setStyles({position: 'relative', overflow: 'hidden', height: panel.offsetHeight, width: panel.offsetWidth});
			
			this.current = 0
		},
		move: function (newTab, curTab) {
			
			var options = this.options,
				transition = options.transitions[this.current];
			this.ct = curTab;
			this.nt = newTab;
			
			//reset first!
			if(curTab) curTab.setStyles({left: 0, top: 0});

			var parts = transition.split('-');

			this.transitions[parts[0]](curTab, newTab, parts[1]);
                        
			this.current = options.random ? $random(0, options.transitions.length - 1) : (this.current + 1) % options.transitions.length
		},
		
		addTransition: function (tr, fn) {
		
			if(typeof tr == 'object') $each(tr, function (fn, key) { this.transitions[key] = fn.bind(this) }, this);
			else this.transitions[tr] = fn.bind(this);
			
			return this
		}
	})
})();

