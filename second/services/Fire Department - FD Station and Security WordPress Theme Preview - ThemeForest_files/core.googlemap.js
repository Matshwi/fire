function fire_department_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'] == 'undefined') fire_department_googlemap_init_styles();
	FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: FIRE_DEPARTMENT_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		fire_department_googlemap_create(id);

	} catch (e) {
		
		//dcl(FIRE_DEPARTMENT_STORAGE['strings']['googlemap_not_avail']);

	};
}

function fire_department_googlemap_create(id) {
	"use strict";

	// Create map
	FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].dom, FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers)
		FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	fire_department_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map)
			FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map.setCenter(FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function fire_department_googlemap_add_markers(id) {
	"use strict";
	for (var i in FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'].geocoder == '') FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'].geocoder.geocode({address: FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() {
						fire_department_googlemap_add_markers(id);
						}, 200);
				} else
					dcl(FIRE_DEPARTMENT_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].title;
			FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map.setCenter(FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].opt.center);
			}
			
			// Add description window
			if (FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].map,
								FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function fire_department_googlemap_refresh() {
	"use strict";
	for (id in FIRE_DEPARTMENT_STORAGE['googlemap_init_obj']) {
		fire_department_googlemap_create(id);
	}
}

function fire_department_googlemap_init_styles() {
	"use strict";
	// Init Google map
    FIRE_DEPARTMENT_STORAGE['googlemap_init_obj'] = {};
    FIRE_DEPARTMENT_STORAGE['googlemap_styles'] = {
		'default': [],
		'invert': [ { "stylers": [ { "invert_lightness": true }, { "visibility": "on" } ] } ],
		'dark': [{"featureType":"landscape","stylers":[{ "invert_lightness": true },{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}],
		'simple': [
				{
				  stylers: [
					{ hue: "#00ffe6" },
					{ saturation: -20 }
				  ]
				},{
				  featureType: "road",
				  elementType: "geometry",
				  stylers: [
					{ lightness: 100 },
					{ visibility: "simplified" }
				  ]
				},{
				  featureType: "road",
				  elementType: "labels",
				  stylers: [
					{ visibility: "off" }
				  ]
				}
			  ],
	'greyscale': [
					{
						"stylers": [
							{ "saturation": -100 }
						]
					}
				],
	'greyscale2': [
				{
				 "featureType": "landscape",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": 20.4705882352941 },
				  { "gamma": 1 }
				 ]
				},
				{
				 "featureType": "road.highway",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": 25.59999999999998 },
				  { "gamma": 1 }
				 ]
				},
				{
				 "featureType": "road.arterial",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": -22 },
				  { "gamma": 1 }
				 ]
				},
				{
				 "featureType": "road.local",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": 21.411764705882348 },
				  { "gamma": 1 }
				 ]
				},
				{
				 "featureType": "water",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": 21.411764705882348 },
				  { "gamma": 1 }
				 ]
				},
				{
				 "featureType": "poi",
				 "stylers": [
				  { "hue": "#FF0300" },
				  { "saturation": -100 },
				  { "lightness": 4.941176470588232 },
				  { "gamma": 1 }
				 ]
				}
			   ],
	'style1': [{
					"featureType": "landscape",
					"stylers": [
						{ "hue": "#FF0300"	},
						{ "saturation": -100 },
						{ "lightness": 20.4705882352941 },
						{ "gamma": 1 }
					]
				},
				{
					"featureType": "road.highway",
					"stylers": [
						{ "hue": "#FF0300" },
						{ "saturation": -100 },
						{ "lightness": 25.59999999999998 },
						{ "gamma": 1 }
					]
				},
				{
					"featureType": "road.arterial",
					"stylers": [
						{ "hue": "#FF0300" },
						{ "saturation": -100 },
						{ "lightness": -22 },
						{ "gamma": 1 }
					]
				},
				{
					"featureType": "road.local",
					"stylers": [
						{ "hue": "#FF0300" },
						{ "saturation": -100 },
						{ "lightness": 21.411764705882348 },
						{ "gamma": 1 }
					]
				},
				{
					"featureType": "water",
					"stylers": [
						{ "hue": "#FF0300" },
						{ "saturation": -100 },
						{ "lightness": 21.411764705882348 },
						{ "gamma": 1 }
					]
				},
				{
					"featureType": "poi",
					"stylers": [
						{ "hue": "#FF0300" },
						{ "saturation": -100 },
						{ "lightness": 4.941176470588232 },
						{ "gamma": 1 }
					]
				}
			],
	'style2': [
		 {
		  "featureType": "landscape",
		  "stylers": [
		   {
		    "hue": "#007FFF"
		   },
		   {
		    "saturation": 100
		   },
		   {
		    "lightness": 156
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 },
		 {
		  "featureType": "road.highway",
		  "stylers": [
		   {
		    "hue": "#FF7000"
		   },
		   {
		    "saturation": -83.6
		   },
		   {
		    "lightness": 48.80000000000001
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 },
		 {
		  "featureType": "road.arterial",
		  "stylers": [
		   {
		    "hue": "#FF7000"
		   },
		   {
		    "saturation": -81.08108108108107
		   },
		   {
		    "lightness": -6.8392156862745
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 },
		 {
		  "featureType": "road.local",
		  "stylers": [
		   {
		    "hue": "#FF9A00"
		   },
		   {
		    "saturation": 7.692307692307736
		   },
		   {
		    "lightness": 21.411764705882348
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 },
		 {
		  "featureType": "water",
		  "stylers": [
		   {
		    "hue": "#0093FF"
		   },
		   {
		    "saturation": 16.39999999999999
		   },
		   {
		    "lightness": -6.400000000000006
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 },
		 {
		  "featureType": "poi",
		  "stylers": [
		   {
		    "hue": "#00FF60"
		   },
		   {
		    "saturation": 17
		   },
		   {
		    "lightness": 44.599999999999994
		   },
		   {
		    "gamma": 1
		   }
		  ]
		 }
	],
	'style3':  [
 {
  "featureType": "landscape",
  "stylers": [
   {
    "hue": "#FFA800"
   },
   {
    "saturation": 17.799999999999997
   },
   {
    "lightness": 152.20000000000002
   },
   {
    "gamma": 1
   }
  ]
 },
 {
  "featureType": "road.highway",
  "stylers": [
   {
    "hue": "#007FFF"
   },
   {
    "saturation": -77.41935483870967
   },
   {
    "lightness": 47.19999999999999
   },
   {
    "gamma": 1
   }
  ]
 },
 {
  "featureType": "road.arterial",
  "stylers": [
   {
    "hue": "#FBFF00"
   },
   {
    "saturation": -78
   },
   {
    "lightness": 39.19999999999999
   },
   {
    "gamma": 1
   }
  ]
 },
 {
  "featureType": "road.local",
  "stylers": [
   {
    "hue": "#00FFFD"
   },
   {
    "saturation": 0
   },
   {
    "lightness": 0
   },
   {
    "gamma": 1
   }
  ]
 },
 {
  "featureType": "water",
  "stylers": [
   {
    "hue": "#007FFF"
   },
   {
    "saturation": -77.41935483870967
   },
   {
    "lightness": -14.599999999999994
   },
   {
    "gamma": 1
   }
  ]
 },
 {
  "featureType": "poi",
  "stylers": [
   {
    "hue": "#007FFF"
   },
   {
    "saturation": -77.41935483870967
   },
   {
    "lightness": 42.79999999999998
   },
   {
    "gamma": 1
   }
  ]
 }
]
}
}