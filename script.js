//#include <stdio.h>
var gmarkers = [];

// object template to make reports
var Report = function(){
	this.summary ="";
	this.time ="";
    this.date ="";	
	this.location = {
		latitude : 0,
		longitude : 0
	}
}

var myLoc = {'lat':null, 'long':0};

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success);
} else {
  error('Geo Location is not supported');
}

function success(position) {
     var lat = position.coords.latitude;
     var long = position.coords.longitude;
     console.log(lat);
}


//drawing google map
var map;
function initMap() {
  	map = new google.maps.Map(document.getElementById('map'), {

        //seattle coords
    	center: {lat: 47.6062, lng: -122.3321},
    	zoom: 14,
    	styles: style
  	});

}

$(function(){
    $.getJSON('https://data.seattle.gov/resource/7ais-f98f.json', function(data) {
    	var tempArr =[];

    	// arrays to hold data
        var myReportArr =[];
        var myCrimeArr =[];
        var date =[];

        // fill arrays
        tempArr = parseReport(data);
        myReportArr = tempArr[0];
        myCrimeArr = tempArr[1];
        date = tempArr[2];

	    //sort alphabetically and filter out duplicates 
        myCrimeArr = myCrimeArr.sort().filter(function(item, pos){ return myCrimeArr.indexOf(item) == pos;});
        date = date.sort().filter(function(item, pos){ return date.indexOf(item) == pos;});

        //append #summary select with options from myCrimeArr
        for(var i = 0; i < myCrimeArr.length; i++){
        	$('#summary').append('<option value="'+myCrimeArr[i]+'">'+myCrimeArr[i]+'</option>');
        }

        //append #date select with options forom date
        for(var i = 0; i < date.length; i++){
        	$('#date').append('<option value="'+date[i]+'">'+date[i]+'</option>');
        }

        //var to hold jquery shortcut
        var sum = $('#summary');
        var dat = $('#date');
        var optchange = $('.change');

        //change event function for filters
        optchange.change(function(){

        	//loop to remove current markers upon filter change
		    for(i=0; i<gmarkers.length; i++){
		        gmarkers[i].setMap(null);
		    }

		    //draw new markers with filter data
        	drawMarker(displayUpdate(sum.val(), dat.val(), myReportArr)); 
        });

        //draw initial markers with filter ALL for both
        drawMarker(displayUpdate(sum.val(), dat.val(), myReportArr));
    });
});

var drawMarker = function(arr){

    //iterate thru array and draw marker for each
    for(i=0; i<arr.length; i++){
	    var marker = new google.maps.Marker({
	        position: {lat: parseFloat(arr[i].location.latitude), lng: parseFloat(arr[i].location.longitude)},
	        map: map,
	        title: arr[i].summary
	    });
	    gmarkers.push(marker); 
	}
}

var parseReport = function(data){
    // 3 arrays i want to return 
	arr =[];
	crimeSumArr =[];
	dateArr =[];
    for(var i = 1; i < data.length; i++){

    	// create report object and add to array
    	arr[i] = new Report();

    	// modify object with data
    	arr[i].location.latitude = data[i].location.latitude;
    	arr[i].location.longitude = data[i].location.longitude;
    	arr[i].summary = data[i].summarized_offense_description;

    	// insert summary into array for #summary filter
    	crimeSumArr.push(data[i].summarized_offense_description);

    	//parse police report date and time and push into object format is "2016-08-12T01:00:00"
        for(var j = 0; j < data[i].date_reported.length; j++){

        	//skip 'T'
        	if( data[i].date_reported[j] == "T" ){

        	}

            //add char to date string
        	else if(j < 10){
        		arr[i].date += data[i].date_reported[j];
        	}

            //add char to time string
        	else if(j < 19){
        		arr[i].time += data[i].date_reported[j];
        	}
        }

        // push object value string to an array for date filter
        dateArr[i] = arr[i].date;
    }

    // 3 arrays i am returning
    return [arr,crimeSumArr,dateArr];
}

var displayUpdate = function(sum, dat, rep){
	var arr = [];

	//use filter settings and compare to conditionals to push data to return array
	for(var i = 1; i < rep.length; i++){
		if(sum == "ALL" && dat == "ALL"){
			arr.push(rep[i]);
		}
		else if(sum == "ALL" && dat != "ALL"){
			if(dat == rep[i].date.full){
				arr.push(rep[i]);
			}
		}
		else if(sum != "ALL" && dat == "ALL"){
			if(sum == rep[i].summary){
				arr.push(rep[i]);
			}
		}
		else {
			if(sum == rep[i].summary && dat == rep[i].date.full){
				arr.push(rep[i]);
			}
		}	
	}
	console.log(arr);
	return arr;
}