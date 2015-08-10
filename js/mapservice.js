goog.provide('ol.source.gmap');
goog.require('ol.Attribution');
goog.require('ol.TileUrlFunction');
goog.require('ol.source.XYZ');
globals={};
ol.gmap={ urlTpl:"http://mt2.google.cn/vt/lyrs={t}&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"};
ol.gmap.tiletype={BASEMAP:"s",LABEL:"h"};
ol.source.gmap = function(options)
{
  this.type = goog.isDef(options.tiletype) ? options.tiletype : ol.gmap.tiletype.BASEMAP;
  goog.base(this, {
	tileGrid:options.tileGrid,
	maxZoom: options.maxZoom,
	tileSize: options.tileSize,
	attributions: options.attributions,
	crossOrigin: options.crossOrigin,
	logo: options.logo,
	projection: options.projection,
	tileLoadFunction: options.tileLoadFunction,
	tilePixelRatio: options.tilePixelRatio,
	tileUrlFunction: function(tileCoord) {
		return ol.gmap.urlTpl.replace('{z}', (tileCoord[0]).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{t}', this.type)
					.replace('{y}', (-tileCoord[2]-1).toString());			
					alert(url);
	},
	wrapX: goog.isDef(options.wrapX) ? options.wrapX : true
  });
};
ol.inherits(ol.source.gmap, ol.source.XYZ);
cser={};
cser.events={
	CLICK:"click",
	DBLCLICK:"dblclick",
	MOUSEDOWN: 'mousedown',
	MOUSEUP: 'mouseup',
	MOUSEOVER: 'mouseover',
	MOUSEOUT: 'mouseout',
	MARKERCLICK:"markerclick",
	MARKERMOUSEOVER:"markermouseover",
	MARKERDRAGEND:"markerdragend",
	MAPCLICK:"mapclick"
};
cser.geo={};
cser.geo.transform=function(coord)
{
	return ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857')
};
cser.geo.reverseTransform=function(coord)
{
	return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326')
};
cser.Object=function(args)
{
	this.options = args;
};

cser.inherits=function(child,parent)
{
 function tempCtor() {};
  tempCtor.prototype = parent.prototype;
  child.superClass_ = parent.prototype;
  child.prototype = new tempCtor();
  child.prototype.constructor = child;
};
cser.base=function(me,args)
{
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }
};
cser.superinvoke=function(me,methodName)
{  
	var caller = arguments.callee.caller;
	var args = new Array(arguments.length - 2);
	  for (var i = 2; i < arguments.length; i++) {
		args[i - 2] = arguments[i];
	  }
	  var ctor = me.constructor
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
	
      return ctor.prototype[methodName].apply(me, args);
    }
  }
};
cser.isDef = function(val) {
  return val !== void 0;
};
cser.observer={};
cser.observer.ol=  function(map) {
  ol.interaction.Pointer.call(this, {
    handleDownEvent: cser.observer.ol.prototype.handleDownEvent,
    handleDragEvent: cser.observer.ol.prototype.handleDragEvent,
    handleMoveEvent: cser.observer.ol.prototype.handleMoveEvent,
    handleUpEvent: cser.observer.ol.prototype.handleUpEvent
  });
  this.map = map;
  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'pointer';

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined;

};
ol.inherits(cser.observer.ol, ol.interaction.Pointer);
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
cser.observer.ol.prototype.handleDownEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

  if (feature && cser.isDef(feature.type) &&feature.type==cser.overlay.overlayTypes.MARKER
	  && cser.isDef(feature.marker) && feature.marker.getDraggable()==true) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }
  else
	{
	  feature = null;
	}

  return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
cser.observer.ol.prototype.handleDragEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
cser.observer.ol.prototype.handleMoveEvent = function(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });
    var element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
cser.observer.ol.prototype.handleUpEvent = function(evt) {
	if (this.feature_!=null)
	{
	  this.feature_.marker.setPosition(cser.geo.reverseTransform(this.coordinate_));
	  var event = this.map.getEvent(cser.events.MARKERDRAGEND);
	  if (cser.isDef(event))
	  {
		  event.call(null,this.feature_.marker);
	  }
	  this.coordinate_ = null;
	  this.feature_ = null;
	  return false;
		
	}
	return true;
};
/**
地图基类
**/
cser.map=function(options)
{	
	this.target = options.target;
	this.minzoom =  cser.isDef(options.minzoom) ? options.minzoom :0;
	this.maxzoom =  cser.isDef(options.maxzoom) ? options.maxzoom :20;
	this.zoom = cser.isDef(options.zoom)?options.zoom:10;
	this.overlays = [];	
	this.center = options.center;
	this.events  = {};
	this.status = {};
};
cser.inherits(cser.map,cser.Object);
cser.map.prototype.addEvent = function(eventName,eventHandler)
{
	this.events[eventName] = eventHandler;
};
cser.map.prototype.removeEvent = function(eventName)
{
	delete this.events[eventName];
	this.events[eventName] = null;
};
cser.map.prototype.getEvent = function(eventName)
{
	return this.events[eventName];
};
cser.status={
	POPUP:'popup'
};
/**
覆盖物
**/
cser.overlay=function(options)
{	
	if ( cser.isDef(options.drawFunction))
	{
		this.drawFunction = options.drawFunction;
	}
	if (cser.isDef(options.attr))
	{
		this.attr = attr;
	}
	if (cser.isDef(options.position))
	{
		this.position =  options.position;
	}
};
cser.overlay.overlayTypes = {
	MARKER:"marker",
	CIRCLE:"circle"
};
cser.inherits(cser.overlay,cser.Object);
cser.overlay.prototype.setAttr=function(attrName,attrValue)
{
	this.attr[attrName]=attrValue;
};
cser.overlay.prototype.getAttr=function(attrName)
{
	return this.attr[attrName];
};
cser.overlay.prototype.getPosition=function()
{
	return this.position;
};
/**绘制function**/
cser.overlay.prototype.setDrawFunction=function(func)
{
	this.drawFunction = func;
};
/**刷新视图**/
cser.overlay.prototype.update=function()
{
	if (this.drawFunction)
	{
		this.drawFunction.apply(this);
	}
};
cser.overlay.prototype.setMap = function(map)
{
	this.map = map;
}
cser.circle=function(options)
{
	cser.base(this,options);
	this.radius = options.radius;
	this.obj = new ol.Feature(
			  new ol.geom.Circle(cser.geo.transform(this.position),this.radius)
		);
};
cser.inherits(cser.circle,cser.overlay);
cser.circle.prototype.setRadius = function(radius)
{

};
cser.circle.prototype.render = function()
{
	
};

/**文本**/
cser.text = function(options)
{
	this.text = cser.isDef(options.text)?options.text:"";
	this.color = cser.isDef(options.color)?options.color:'white';
	this.font = cser.isDef(options.font)?options.font:'Arial';
	this.size = cser.isDef(options.size)?options.size:'12px';
	this.weight = cser.isDef(options.weight)?options.weight:'normal';
	this.offset = cser.isDef(options.offset)?options.offset:[0,0];
	this.textObj = new ol.style.Text({
				text: this.text,
				stroke: new ol.style.Stroke({color:this.color, width: 1}),
				offsetX: this.offset[0],
				offsetY: this.offset[1],
				font: this.weight + ' ' + this.size + ' ' + this.font,
			  });
};
cser.text.prototype.render = function()
{
	return this.textObj;
};
cser.text.prototype.setText=function(arg)
{
	this.text = arg;
	this.textObj.setText(this.text);
};
cser.text.prototype.getFont = function()
{
	return this.weight + ' ' + this.size + ' ' + this.text;
};
cser.text.prototype.setFontSize=function(size)
{
	this.size = size;
	this.textObj.setFont(this.getFont());
};
cser.text.prototype.setColor=function(color)
{
	this.color = color;
	this.textObj.getStroke().setColor(color);
};
cser.icon = function(options)
{
	this.src = options.src;
	this.anchor = cser.isDef(options.anchor)?options.anchor:[0,0];
	this.opacity = cser.isDef(options.opacity)?options.opacity:0.9;
	if (cser.isDef(options.size))
	{
		this.size =  options.size;
	}
	this.iconObj  = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: this.anchor,
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				opacity:this.opacity,
				src: this.src
			}))
};
cser.icon.prototype.render = function()
{
	return this.iconObj;
};
/**标注点*/
cser.marker=function(options)
{	
	cser.base(this,options);
	if (cser.isDef(options.icon))
	{
		this.icon =  options.icon;
	}
	if (cser.isDef(options.label))
	{
		this.label =  options.label;
	}
	this.draggable = cser.isDef(options.draggable)?options.draggable:false;
};
cser.inherits(cser.marker,cser.overlay);
cser.marker.prototype.setDraggable=function(arg)
{
	this.draggable = arg;
};
cser.marker.prototype.getDraggable=function()
{
	return this.draggable;
};
/**位置**/
cser.marker.prototype.setPosition =function(point)
{
	this.position = point;
	if (this.iconFeature)
	{
		this.iconFeature.setGeometry(new ol.geom.Point(cser.geo.transform(this.position)));
	}
	this.update();
};

/**图标**/
cser.marker.prototype.setIcon = function(icon)
{
	this.icon = icon;
	if (this.iconFeature)
	{
		this.iconFeature.getStyle().setImage(this.icon.render);
	}
	this.update();
};
/*绘制更新**/
cser.marker.prototype.render=function()
{
	if (!cser.isDef(this.iconFeature))
	{
		this.iconFeature = new ol.Feature({
		  geometry:new ol.geom.Point(cser.geo.transform(this.position))
		});
		var iconStyle = new ol.style.Style({
		  image: this.icon.render(),
			text:this.label.render()
		});
		this.iconFeature.setStyle(iconStyle);
		this.iconFeature.type = cser.overlay.overlayTypes.MARKER;
		this.iconFeature.marker = this;
	}
	return this.iconFeature;
};

cser.gmarker = function(options)
{
	cser.base(this,options);
};
cser.inherits(cser.gmarker,cser.marker);
cser.gmarker.prototype.setPosition=function(point)
{
	cser.superinvoke(this,'setPosition',point);
};

cser.gmap=function(options)
{
	cser.base(this,options);
	this.vectorLayer = new ol.layer.Vector({
			 source:  new ol.source.Vector({
			features: []
		})
	});
	this.map = new ol.Map({
		interactions: ol.interaction.defaults().extend([new cser.observer.ol(this)]),
        target: this.target,
			 controls: ol.control.defaults({
			 attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
				  collapsible: false
				})
			  }),
        layers:[new ol.layer.Tile({
			  source: new ol.source.gmap({
				maxZoom: this.maxzoom,
				tiletype:ol.gmap.tiletype.BASEMAP,
				wrapX: true
			  })
			 }),
			new ol.layer.Tile({
			source:new ol.source.gmap({
			maxZoom: this.maxzoom,
			tiletype:ol.gmap.tiletype.LABEL,
			wrapX: true
		  })
		}),this.vectorLayer],
        view: new ol.View({
          center: cser.geo.transform(this.center),
          zoom: this.zoom
        })
      });
	globals.map = this.map;
	this.initEventListener();
};
cser.inherits(cser.gmap,cser.map);
cser.gmap.prototype.initEventListener=function()
{
	var events = this.events;
	var that = this;
	this.map.getView().on("propertychange",function()
	{
		if (that.status[cser.status.POPUP])
		{
			that.closePopup();
		}
	});
	this.map.on('click', function(evt) {
		if (events[cser.events.MARKERCLICK])
		{
			var feature = globals.map.forEachFeatureAtPixel(evt.pixel,
			  function(feature, layer) {
				return feature;
			  });
		  if (feature && feature.type==cser.overlay.overlayTypes.MARKER) {
				events[cser.events.MARKERCLICK].call(that,feature.marker,evt);
				return;
		  } 
		}
		if (events[cser.events.MAPCLICK])
		{
			evt.position = cser.geo.reverseTransform(evt.coordinate);
			events[cser.events.MAPCLICK].call(that,evt);
		}
		that.closePopup();
	});

	this.map.on('pointermove', function(evt) {
		  if (evt.dragging) {
			that.closePopup();
			return;
		  }
		if (events[cser.events.MARKERMOUSEOVER])
		{
		  var pixel = globals.map.getEventPixel(evt.originalEvent);
		  var feature = globals.map.forEachFeatureAtPixel(evt.pixel,
				  function(feature, layer) {
					return feature;
				  });
		  if (feature && feature.type==cser.overlay.overlayTypes.MARKER) {
					globals.map.getTarget().style.cursor = 'pointer';
					events[cser.events.MARKERMOUSEOVER].call(that,feature.marker,evt);
					return;
			} 
			globals.map.getTarget().style.cursor = '';
			that.closePopup();
		}
	});

};
cser.gmap.prototype.addOverlay=function(overlay)
{
	this.overlays.push(overlay);
	overlay.setMap(this);
	var overlayFeature = overlay.render();
	if (cser.isDef(overlayFeature))
	{
		this.vectorLayer.getSource().addFeature(overlayFeature);
	}
};
cser.map.prototype.showPopup=function(overlay,title,content,offset)
{
	if (!cser.isDef(this.popup))
	{
		var pv = document.createElement('div');
		pv.className = 'popup';
		pv.id  = "popup";
		this.target.appendChild(pv);
		this.popup=new ol.Overlay({
			  element: pv,
			  positioning: 'bottom-center',
			  stopEvent: true
			});
		this.map.addOverlay(this.popup);
	}
	 var showPosition = overlay.render().getGeometry().getCoordinates();//cser.geo.transform(position);
	 if (offset)
	 {
		 showPosition[0]=showPosition[0]+offset[0]*this.map.getView().getResolution();
		 showPosition[1]=showPosition[1]+offset[1]*this.map.getView().getResolution();
	 }
	 this.popup.setPosition(showPosition);
	$('#popup').qtip({ 
		content: {text: content,title:title}, hide: { event: false  },  position: {my: 'bottom center',at: 'bottom center'},style: {classes: 'qtip-light qtip-shadow qtip-rounded'}
	});
	$("#popup").qtip('show');
	this.status[cser.status.POPUP]=true;

};
cser.map.prototype.closePopup=function()
{
	if (cser.isDef(this.popup))
	{
		$('#popup').qtip('hide');
		this.status[cser.status.POPUP]=false;
	}
}