const NodeGeocoder = require('node-geocoder');

var options = {
  provider:process.env.GEOCODER_PROVIDER,
  // Optionnal depending of the providers
  httpAdapter: 'https', // Default
  apiKey:process.env.MAPQUEST_GEOCODER_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);
module.exports=geocoder;