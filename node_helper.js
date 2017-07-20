'use strict';

/* Magic Mirror
 * Module: MMM-lyft
 *
 * By Kyle Kelly
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);

		this.config = null;
	},

	getAccessToken: function() {
		var self = this;
		
		request({
			url: 'https://api.lyft.com/oauth/token',
			method: 'POST',
			auth: {
				user: this.config.clientId,
				pass: this.config.clientSecret
			},
			form: {
				'grant_type': 'client_credentials'
			}
		}, function (error, response, body) {
		  	if (!error && response.statusCode == 200) {
				self.sendSocketNotification("ACCESS_SUCCESS", null);
				var json = JSON.parse(body);
				self.config.access_token = json.access_token;
			}
			else {
				self.sendSocketNotification("ACCESS_ERROR", "In OAUTH request with status code: " + response.statusCode);
			}		
		});
	},				
	
	getData: function() {
		var self = this;
		
		request({
			url: 'https://api.lyft.com/v1/eta?lat=' + this.config.lat + '&lng=' + this.config.lng,
			method: 'GET',
			auth: {
				'bearer': this.config.access_token
			}
		}, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("TIME", body);
			}
			else {
				self.sendSocketNotification("TIME_ERROR", "In TIME request with status code: " + response.statusCode);
			}
		});

		request({
			url: 'https://api.lyft.com/v1/cost?start_lat=' + this.config.lat + '&start_lng=' + this.config.lng + '&end_lat=' + this.config.lat + '&end_lng=' + this.config.lng,
			method: 'GET',
			auth: {
				'bearer': this.config.access_token
			}
		}, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("COST", body);
			}
			else {
				self.sendSocketNotification("COST_ERROR", "In COST request with status code: " + response.statusCode);
			}
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "CONFIG") {
			this.config = payload;
		}
		else if (notification === "ACCESS" && this.config !== null) {
			this.getAccessToken();
		}
		else if (notification === "DATA" && this.config !== null){
			this.getData();
		}
	}
});
