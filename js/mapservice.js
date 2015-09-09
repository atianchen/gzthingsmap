goog.provide('ol.source.gmap');
goog.require('ol.Attribution');
goog.require('ol.TileUrlFunction');
goog.require('ol.source.XYZ');
globals={};

ol.gmap={ urlTpl:"http://mt2.google.cn/vt/lyrs={t}&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"};
ol.gmap.tiletype={BASEMAP:"s",LABEL:"h"};
ol.amap={urlTpl:"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"};
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
	},
	wrapX: goog.isDef(options.wrapX) ? options.wrapX : true
  });
};
ol.inherits(ol.source.gmap, ol.source.XYZ);
ol.source.amap = function(options)
{
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
			return ol.amap.urlTpl.replace('{z}', (tileCoord[0]).toString())
				.replace('{x}', tileCoord[1].toString())
				.replace('{y}', (-tileCoord[2]-1).toString());
		},
		wrapX: goog.isDef(options.wrapX) ? options.wrapX : true
	});
};
ol.inherits(ol.source.amap, ol.source.XYZ);
cser={};
cser.events={
	CLICK:"click",
	DBLCLICK:"dblclick",
	MOUSEDOWN: 'mousedown',
	MOUSEUP: 'mouseup',
	MOUSEOUT: 'mouseout',
	MARKERCLICK:"markerclick",
	OVERLAYCLICK:"overlayclick",
	MOUSEMOVE:"mousemove",
	MARKERMOUSEOVER:"markermouseover",
	MARKERDRAGEND:"markerdragend",
	MAPCLICK:"mapclick"
};
cser.geo={};
cser.geo.transform=function(coord)
{
	if (coord instanceof Array && coord.length>0 && coord[0] instanceof Array)
	{
		var rs = [];
		for (var i=0;i<coord.length;i++)
		{
			rs.push(cser.geo.transform(coord[i]));
		}
		return rs;
	}
	else
	{
		return ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857')
	}
};
cser.geo.reverseTransform=function(coord)
{
	return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326')
};
cser.color={};
cser.color.hexToRgb=function(hexColor)
{
	hexColor = goog.color.normalizeHex(hexColor);
	var r = parseInt(hexColor.substr(1, 2), 16);
	var g = parseInt(hexColor.substr(3, 2), 16);
	var b = parseInt(hexColor.substr(5, 2), 16);

	return [r, g, b];
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
	this.overlays = {_seq:0};
	this.center = options.center;
	this.events  = {};
	this.status = {};
};
cser.inherits(cser.map,cser.Object);
cser.map.prototype.setCenter = function(point)
{
	this.center  = point;
};
cser.map.prototype.setZoom = function(zoom)
{
	this.zoom = zoom;
};
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
	CIRCLE:"circle",
	LINE:"line"
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
};
/**几何图形**/
cser.geometry=function(options)
{
	cser.base(this,options);
	this.opacity = cser.isDef(options.opacity)?options.opacity:0.9;
	this.strokeOpacity = cser.isDef(options.strokeOpacity)?options.strokeOpacity:0.9;
	if  (cser.isDef(options.color))
	{
		var rgb = cser.color.hexToRgb(options.color);
		this.color = [rgb[0],rgb[1],rgb[2],this.strokeOpacity];
	}
	if  (cser.isDef(options.strokeWidth))
	{
		this.strokeWidth = options.strokeWidth;
	}
	if (cser.isDef(options.fillColor))
	{
		var rgb = cser.color.hexToRgb(options.fillColor);
		this.fillColor = [rgb[0],rgb[1],rgb[2],this.opacity];
	}
	else{
		this.fillColor = [255,255,255,this.opacity];
	}
};
cser.inherits(cser.geometry,cser.overlay);
cser.geometry.prototype.setFillColor = function(color)
{
	var rgb = cser.color.hexToRgb(color);
	this.fillColor = [rgb[0],rgb[1],rgb[2],this.opacity];
	this.feature.getStyle().getFill().setColor(this.fillColor);
};
cser.geometry.prototype.setOpacity = function(opacity)
{
	this.opacity = opacity;
	this.fillColor[3]=this.opacity;
	this.feature.getStyle().getFill().setColor(this.fillColor);
};
cser.geometry.prototype.getStyle = function()
{

	if (cser.isDef(this.color)  && cser.isDef(this.fillColor))
	{
		return new ol.style.Style({
			fill: new ol.style.Fill({
				color:this.fillColor
			}),
			stroke:new ol.style.Stroke({
				width: (cser.isDef(this.strokeWidth))?this.strokeWidth:1,
				color: this.color
			})
		});
	}
	else if (cser.isDef(this.fillColor))
	{
		return new ol.style.Style({
			fill: new ol.style.Fill({
				color:this.fillColor
			})
		});
	}
	else
	{
		return new ol.style.Style({
			stroke:new ol.style.Stroke({
				width: (cser.isDef(this.strokeWidth))?this.strokeWidth:1,
				color: this.color
			})
		});
	}
};
/**圆形**/
cser.circle=function(options)
{
	cser.base(this,options);
	this.radius = options.radius;

	this.feature = new ol.Feature(
		{geometry: new ol.geom.Circle(cser.geo.transform(this.position),this.radius)}
		);
	this.feature.setStyle(this.getStyle());
};
cser.inherits(cser.circle,cser.geometry);
cser.circle.prototype.setRadius = function(radius)
{
	this.radius = radius;
	this.feature.getGeometry().setRadius(radius);
};
cser.circle.prototype.setCenter = function(point)
{
	cser.superinvoke(this,'setPosition',point);
	this.feature.getGeometry().setCenter(cser.geo.transform(point));
};
cser.circle.prototype.render = function()
{
	return this.feature;
};

/**line**/
cser.line = function(options)
{
	cser.base(this,options);
	this.points = options.points;
	this.feature = new ol.Feature(
		{geometry: new ol.geom.LineString(cser.geo.transform(this.points))}
	);
	this.feature.setStyle(this.getStyle());
	this.feature.type = cser.overlay.overlayTypes.LINE;
	this.feature.overlay = this;
};
cser.inherits(cser.line,cser.geometry);
cser.line.prototype.setPoints = function(points)
{
	this.points = points;
	this.feature.getGeometry().setCoordinates(cser.geo.transform(this.points));
};
cser.line.prototype.getPoints = function()
{
	return this.points;
};
cser.line.prototype.render = function()
{
	return this.feature;
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
				font: this.weight + ' ' + this.size + ' ' + this.font
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
		var oldStyle = this.iconFeature.getStyle();
		this.iconFeature.setStyle(this.getStyle());
		delete oldStyle;
		oldStyle = null;
	}
	this.update();
};
cser.marker.prototype.setLabel = function(text)
{
	this.label = text;
	if (this.iconFeature)
	{
		var oldStyle = this.iconFeature.getStyle();
		this.iconFeature.setStyle(this.getStyle());
		delete oldStyle;
		oldStyle = null;
	}
};
cser.marker.prototype.getLabel = function()
{
	return this.label;
};
cser.marker.prototype.getStyle = function()
{
	var iconStyle = null;
	if (cser.isDef(this.label))
	{
		iconStyle = new ol.style.Style({
			image: this.icon.render(),
			text:this.label.render()
		});
	}
	else{
		iconStyle = new ol.style.Style({
			image: this.icon.render()
		});
	}
	return iconStyle;
};
/*绘制更新**/
cser.marker.prototype.render=function()
{
	if (!cser.isDef(this.iconFeature))
	{
		this.iconFeature = new ol.Feature({
		  geometry:new ol.geom.Point(cser.geo.transform(this.position))
		});


		this.iconFeature.setStyle(this.getStyle());
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
MAPTYPE_NORMAL = "NORMAL";
MAPTYPE_SATELLITE ="SATELLITE";
cser.gmap=function(options)
{
	cser.base(this,options);
	this.vectorLayer = new ol.layer.Vector({
			 source:  new ol.source.Vector({
			features: []
		})
	});
	this.tiles = {
		SATELLITE:[
		new ol.layer.Tile({
			source: new ol.source.gmap({
				maxZoom: this.maxzoom,
				tiletype: ol.gmap.tiletype.BASEMAP,
				wrapX: true
			})
		}),
		new ol.layer.Tile({
			source: new ol.source.gmap({
				tiletype: ol.gmap.tiletype.LABEL,
				wrapX: true
			})
		})]
		,
		NORMAL:[
			new ol.layer.Tile({
				source: new ol.source.amap({
					wrapX: true
				})
			})
		]
	};
	this.controls = [];
	this.mapType = cser.isDef(options.mapType)?options.mapType:MAPTYPE_SATELLITE;
  	this.minZoom = cser.isDef(options.minZoom)?options.minZoom:1;
	this.maxZoom = cser.isDef(options.maxZoom)?options.maxZoom:22;
	this.map = new ol.Map({
		interactions: ol.interaction.defaults().extend([new cser.observer.ol(this)]),
        target: this.target,
			 controls: ol.control.defaults({
			 attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
				  collapsible: false
				})
			  }).extend([
				 new ol.control.ScaleLine()
			 ]),
        layers:[],
        view: new ol.View({
          center: cser.geo.transform(this.center),
          zoom: this.zoom,
			minZoom: this.minZoom,
			maxZoom: this.maxZoom
        })
      });
	for (var i=0;i<this.tiles[this.mapType].length;i++)
	{
		this.map.addLayer(this.tiles[this.mapType][i]);
	}
	this.map.addLayer(this.vectorLayer);
	globals.map = this.map;
	this.initEventListener();
	this.width = $("#"+this.target.id).width();
	this.height = $("#"+this.target.id).height();
	$(window).resize(
			function()
			{
				var ctrls = globals.map.getControls();
				for (var i=0;i<ctrls.length;i++)
				{
					ctrls[i].render();
				}
			}

	);
};
cser.inherits(cser.gmap,cser.map);
cser.gmap.prototype.getControls = function()
{
	return this.controls;
};
cser.gmap.prototype.addControl = function(control)
{
	control.setMap(this);
	this.controls.push(control);
	control.render();
};
cser.gmap.prototype.getSize = function()
{
	return [this.width,this.height];
};
cser.gmap.prototype.setZoom = function(zoom)
{
	cser.superinvoke(this,'setZoom',zoom);
	map.getView().setZoom(zoom);
};
cser.gmap.prototype.setMapType = function(mt)
{
	if (this.mapType == mt)
	{
		return;
	}
	for (var i=0;i<this.tiles[this.mapType].length;i++)
	{
		this.map.removeLayer(this.tiles[this.mapType][i]);
	}
	this.map.removeLayer(this.vectorLayer);
	this.mapType = mt;
	for (var i=0;i<this.tiles[this.mapType].length;i++)
	{
		this.map.addLayer(this.tiles[this.mapType][i]);
	}
	this.map.addLayer(this.vectorLayer);
};
cser.gmap.prototype.getMapType = function()
{
	return this.mapType;
};
cser.gmap.prototype.setCenter = function(point)
{
	cser.superinvoke(this,'setCenter',point);
	this.map.getView().setCenter(cser.geo.transform(this.center));
};
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
	this.map.on("dblclick",function(evt)
	{
		if (events[cser.events.DBLCLICK])
		{
			evt.position = cser.geo.reverseTransform(evt.coordinate);
			events[cser.events.DBLCLICK].call(that,evt);
			return false;
		}
	});
	this.map.on('click', function(evt) {

		if (events[cser.events.MARKERCLICK] || events[cser.events.OVERLAYCLICK])
		{
			evt.position = cser.geo.reverseTransform(evt.coordinate);
			var feature = globals.map.forEachFeatureAtPixel(evt.pixel,
			  function(feature, layer) {
				return feature;
			  });
		  if (feature){
			  	if ( feature.type==cser.overlay.overlayTypes.MARKER && events[cser.events.MARKERCLICK]) {
					events[cser.events.MARKERCLICK].call(that, feature.marker, evt);
					return;
				}
				else if (events[cser.events.OVERLAYCLICK]) {
					events[cser.events.OVERLAYCLICK].call(that, feature.overlay, evt);
					return;
				}
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

		var pixel = globals.map.getEventPixel(evt.originalEvent);
		evt.position = cser.geo.reverseTransform(evt.coordinate);
		if (events[cser.events.MOUSEMOVE])
		{
			events[cser.events.MOUSEMOVE].call(that,evt);
		}
		if (events[cser.events.MARKERMOUSEOVER])
		{

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
			//that.closePopup();
		}

	});

};
cser.gmap.prototype.addOverlay=function(overlay)
{
	overlay._id = ++this.overlays.seq;
	this.overlays[overlay._id]=overlay;
	overlay.setMap(this);
	var overlayFeature = overlay.render();
	if (cser.isDef(overlayFeature))
	{
		this.vectorLayer.getSource().addFeature(overlayFeature);
	}
};
cser.gmap.prototype.removeOverlay=function(overlay)
{
	this.vectorLayer.getSource().removeFeature(overlay.render());
	var _id = overlay._id;
	delete overlay;
	this.overlays[_id]=null;
};
cser.gmap.prototype.showPopupAtPosition=function(position,title,content,offset)
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
	if (offset)
	{
		position[0]=position[0]+offset[0]*this.map.getView().getResolution();
		position[1]=position[1]+offset[1]*this.map.getView().getResolution();
	}
	this.popup.setPosition(position);
	$('#popup').qtip({
		content: {text: content,title:{text:title,button:"关闭"}}, hide: { event: false  },  position: {my: 'bottom center',at: 'bottom center'},style: {classes: 'qtip-light qtip-shadow qtip-rounded'}
	});
	$("#popup").qtip('show');
	this.status[cser.status.POPUP]=true;
};
cser.gmap.prototype.showPopup=function(overlay,title,content,offset)
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
	$('#popup').qtip({  overwrite: true,
		content: {text: content,title:{text:title,button:"关闭"}}, hide: { event: false  },  position: {my: 'bottom center',at: 'bottom center'},style: {classes: 'qtip-light qtip-shadow qtip-rounded'}
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
};
cser.map.prototype.isPopupShow=function()
{
	return this.status[cser.status.POPUP];
};
POSITION_LEFTTOP = "lt";
POSITION_RIGHTTOP = "rt";
cser.control = function(options)
{
	this.anchor = cser.isDef(options.anchor)?options.anchor:[0,0];
	this.position = options.position;
	this.clickListener = options.click;
	this.html = options.html;
	this.id = options.id;
	this.className = options.className;
};
cser.inherits(cser.control,cser.Object);
cser.control.prototype.setMap = function(map)
{
	this.map = map;
};
cser.control.prototype.setPosition = function(pos)
{
	this.position = pos;
};
cser.control.prototype.getPosition = function() {
	return this.position;
};
cser.control.prototype.render =function() {
	if ($("#"+this.id).length<1) {
		var pv = document.createElement('div');
		pv.className = 'mapcontrol';
		pv.id = this.id;
		globals.map.getTarget().appendChild(pv);
		var that = this;
		$("#" + this.id).click(
			function () {
				that.clickListener.call(that, that.map);
			}
		);
		if (cser.isDef(this.className))
			$("#" + this.id).addClass(this.className);
		if (cser.isDef(this.html))
			$("#" + this.id).html(this.html);
	}
	var x,y=0;
	if (this.position==POSITION_LEFTTOP)
	{x = 0;y=0}
	else if (this.position==POSITION_RIGHTTOP)
	{x=this.map.width;y=0;}
	x = x+this.anchor[0];
	y = y+this.anchor[1];
	$("#"+this.id).css({left:x+"px",top:y+"px"});
};
cser.mapTypeControl = function(options)
{
	if (!cser.isDef(options))
		options={};
	options.position = POSITION_RIGHTTOP;
	options.anchor = cser.isDef(options.anchor)?options.anchor:[-100,20];
	options.id = "mapTypeControl";
	options.className = "mapTypeControl";
	options.html="<span title='卫星图'></span>";
	var that = this;
	options.click = function(map)
	{
		if (map.getMapType() ==MAPTYPE_NORMAL)
			map.setMapType(MAPTYPE_SATELLITE);
		else
			map.setMapType(MAPTYPE_NORMAL);
		if (that.map.getMapType()==MAPTYPE_NORMAL) {
			$("#" + that.id + " span").attr("title", "普通地图").removeClass("actived");
		}
		else {
			$("#" + that.id + " span").attr("title", "卫星地图").addClass("actived");
		}
	};
	cser.base(this,options);
};
cser.inherits(cser.mapTypeControl,cser.control);
cser.mapTypeControl.prototype.render =function() {
	cser.superinvoke(this,'render');
	if (this.map.getMapType()==MAPTYPE_NORMAL)
		$("#"+this.id+" span").attr("title","普通地图").removeClass("actived");
	else
		$("#"+this.id+" span").attr("title","卫星地图").addClass("actived");
}
