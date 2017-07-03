# MMM-lyft

To install, clone this repository into your modules folder. Then add the following to your configuration file:
```
{
    module: 'MMM-lyft',
    position: 'top_left',
    header: 'Lyft (DC)',
    config: {
        lat: XX.XXXX,  // use your exact pickup loaction
        lng: XX.XXXX, // use your exact pickup loaction
        clientId: '<your client ID>', 
        clientSecret: '<your client secret>',
    }
},
```
The client ID and client secret are acquired through Lyft by [registering as a devloper](https://www.lyft.com/developers). 

## Configuration Options

The following properties can be configured:

| Options | Description|
| --- | --- |
|```header```| Can be changed to any **string** or left **blank**: ```' '``` |
| ```ride_type```| The ride type for time and cost estimates. 
**Possible values:** ```'Lyft Plus'```, ```'Lyft Line'```, ```'Lyft Premier'```, ```'Lyft Lux'```, ```'Lyft Lux SUV'```. 
**Default value:** ```'Lyft'```.|