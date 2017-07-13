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
		access_token: null,
		ride_type: 'Lyft',

		updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
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
		this.lyftSurge = null;

		this.loaded = false;
		Log.log("Sending CONFIG to node_helper.js in " + this.name);
		Log.log("Payload: " + this.config);
		this.sendSocketNotification('CONFIG', this.config);
	},

	// unload the results from lyft services
	processLyft: function(FLAG, result) {
		var self = this;
		Log.log("ProcessLyft");

		// go through the time data to find the lyft eta estimate
		if (FLAG === "TIME"){
			Log.log("Time:");
			Log.log(result);
			for (var i = 0, count = result.eta_estimates.length; i < count ; i++) {

				var rtime = result.eta_estimates[i];
				
				if(rtime.display_name === this.config.ride_type){
					// convert estimated seconds to minutes
					this.lyftTime = rtime.eta_seconds / 60;
					Log.log("Lyft time = " + this.lyftTime);
					break;
				}
			}
		}

		// go through the ride estimate data to find the lyft primetime percentage
		else if (FLAG === "COST"){
			Log.log("Cost:");
			Log.log(result);
			for( var i=0, count = result.cost_estimates.length; i< count; i++) {
				var rprice = result.cost_estimates[i];

				if(rprice.display_name === this.config.ride_type){
					// grab the surge pricing
					this.lyftSurge = rprice.primetime_percentage;
					Log.log("Lyft surge: " + this.lyftSurge);
					break;
				}
			}
		}
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var lyft = document.createElement("div");
		lyft.className = "lyftButton";
		
		var lyftIcon = document.createElement("img");
		lyftIcon.className = "badge";
		lyftIcon.src = "modules/MMM-lyft/LYFT_API_Badges_1x_22px.png";

		var lyftText = document.createElement("span");

		if(this.loaded) {
			var myText = this.config.ride_type + " in "+ this.lyftTime +" min ";
			// only show the surge pricing if it is above 1.0
			if(typeof this.lyftSurge !== "undefined" && this.lyftSurge !== "0%"){
				myText += " + " + this.lyftSurge + " Prime Time";
			}
			lyftText.innerHTML = myText;
		} else {
			// Loading message
			lyftText.innerHTML = "Checking Lyft status ...";
		}

		lyft.appendChild(lyftIcon);
		lyft.appendChild(lyftText);
		
		wrapper.appendChild(lyft);
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		//Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		if (notification === "TIME") {
			this.processLyft("TIME", JSON.parse(payload));
			this.updateDom(this.config.animationSpeed);
		}
		else if (notification === "COST") {
			this.processLyft("COST", JSON.parse(payload));
			this.loaded = true;
			this.updateDom(this.config.animationSpeed);
		}
	}

});
