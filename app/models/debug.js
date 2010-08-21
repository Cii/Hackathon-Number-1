/*
 * debug.js
*/

var debugError = function(level, msg){
    level = level.toUpperCase();
    
    if(Mojo.Log) {
        Mojo.Log.error(level + ': ' + msg);
    } else {
        console.log(level + ': ' + msg);
    }
};

var debugString = function(msg){
	if(Mojo.Log) {
		Mojo.Log.info('INFO: ' + msg)
	} else {
		console.log('INFO: ' + msg);
	}
};

var debugObject = function(obj, reflectType){
    if(reflectType === 'properties') {
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                debugString('OBJECT ITERATION: ' + i + ' : ' + obj[i]);
            }
        }
    } else if(reflectType === 'noFuncs') {
        for(var i in obj) {
            if(typeof obj[i] !== 'function') {
                debugString('OBJECT ITERATION: ' + i + ' : ' + obj[i]);
            }
        }
    } else {
        for(var i in obj) {
            debugString('OBJECT ITERATION: ' + i + ' : ' + obj[i]);
        }

    }
};