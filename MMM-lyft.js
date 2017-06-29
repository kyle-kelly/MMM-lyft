/* global Module */

/* Magic Mirror
 * Module: Lyft
 *
 * By Kyle Kelly
 * MIT Licensed.
 */

 Module.register("MMM-lyft", {

 	// Default module config.
	defaults: {
		lat: null,
		lng: null,
		clientId: null,
		clientSecret: null,
		ride_type: 'lyft',

		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "https://code.jquery.com/jquery-2.2.3.min.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-lyft.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		// variables that will be loaded from service
		this.lyftTime = null;

		// start the timer
		this.loaded = false;
		this.scheduleUpdate(0);
		this.updateTimer = null;
	},

	// start load timer (with posibility of delay)
	scheduleUpdate: function(delay) {
		Log.info("Schedule update: " + this.name);
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateLyft();
		}, nextLoad);
	},

	// reach out to Lyft dev API using REST
	updateLyft: function() {
		
		var self = this;

		// first get the access token
		$.ajax({
		    url: 'https://api.lyft.com/oauth/token',
			beforeSend: function(xhr) { 
		      xhr.setRequestHeader("Authorization", "Basic " + btoa(self.config.clientId + ":" + self.config.clientSecret)); 
		    },
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: {
				grant_type: 'client_credentials',
				scope: 'public'
			},
			success: function(lyftAccessToken) {
				Log.log('Lyft Access Token');
				Log.log(lyftAccessToken);
		    	
		    	// then get the eta estimate
		    	$.ajax({
		    		url: "https://api.lyft.com/v1/eta?",
		    		beforeSend: function(xhr) { 
				      xhr.setRequestHeader("Authorization", "Bearer " + btoa(lyftAccessToken)); 
				    },
		    		type: 'GET',
		    		dataType: 'json',
				    data: {
				        lat: self.config.lat,
				        lng: self.config.lng,
				        ride_type: self.config.ride_type
				    },
				    crossDomain: true,
				    success: function(etaEstimate) {
				    	Log.log('ETA Estimate');
				    	Log.log(etaEstimate);

				    	// when we have the result, process the result payload
				    	self.processLyft(etaEstimate);
				    	// schedule the next update
		        		self.scheduleUpdate(-1);
				    },
				    error: function(error) {
						Log.log(error);
					}
		    	});
		    },
		    error: function(error) {
				Log.log(error);
			}
		});
	},

	// unload the results from lyft services
	processLyft: function(etaEstimate) {
		var self = this;
		Log.log("processLyft");
		Log.log(etaEstimate);

		// go through the eta_estimates data to find the lyft product
		for (var i = 0, count = etaEstimate.eta_estimates.length; i < count ; i++) {

			var rtime = etaEstimate.eta_estimates[i];
			
			if(rtime.ride_type === self.config.ride_type){
				// convert estimated seconds to minutes
				this.lyftTime = rtime.eta_seconds / 60;
				break;
			}
		}		

		// when done, redraw the module
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var lyft = document.createElement("div");
		lyft.className = "lyftButton";
		
		var lyftIcon = document.createElement("img");
		lyftIcon.className = "badge";
		lyftIcon.src = "modules/MMM-lyft/img/LYFT_API_Badges_1x_22px.png";

		var lyftText = document.createElement("span");

		if(this.loaded) {
			var myText = self.config.ride_type + " in "+ this.lyftTime +" min ";
			lyftText.innerHTML = myText;
		} else {
			// Loading message
			lyftText.innerHTML = "Checking Lyft status ...";
		}
		

		lyft.appendChild(lyftIcon);
		lyft.appendChild(lyftText);
		
		wrapper.appendChild(lyft);
		return wrapper;
	}

});
