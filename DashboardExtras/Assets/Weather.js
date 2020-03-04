

(function (win) {
    'use strict';

    var listeners = [],
        doc = win.document,
        MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
        observer;



    function ready(selector, fn) {
        // Store the selector and callback to be monitored
        listeners.push({
            selector: selector,
            fn: fn
        });
        if (!observer) {
            // Watch for changes in the document
            observer = new MutationObserver(function (mutations) {

                check()
            });
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
            });
        }
        // Check if the element is currently in the DOM
        check();
    }



    function check() {
        // Check the DOM for elements matching a stored selector
        for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];

                // Make sure the callback isn't invoked with the 
                // same element more than once
                if (!element.ready) {
                    element.ready = true;
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
    }

    // Expose `ready`
    win.ready = ready;

})(this);



//Theme objectives

var ApiClient = () => {
    getJSON((endpoint) => {
        return new Promise((resolve, reject) => {
            var url = window.location.href.split("/web")[0] + "/emby";
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                xhr.status === 200 ? resolve(JSON.parse(xhr.responseText)) : reject(xhr.status);
            }
            xhr.send();
        });
    });

} 

//Add UpTime, Weather and Drive Space to the Dashboard
var upTimeCounter;
ready(".localUrl", (element) => {
    clearInterval(upTimeCounter);

    // Create a the upTime Element
    var upTimeNode = document.createElement('p');
    upTimeNode.id = 'upTime';

    var totalStorageNode = document.createElement('p');
    totalStorageNode.id = 'totalStorage';

    // Insert the upTime node before the #localUrl node
    element.parentNode.insertBefore(upTimeNode, element);

    element.parentNode.insertBefore(totalStorageNode, element);

    ApiClient.getJSON('/GetSystemUptimeData').then((json) => {
        upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeDays'] + ' Days ' + json['UpTimeHours'] + ' Hours';
    });

    ApiClient.getJSON('/GetTotalStorage').then((json) => {
        totalStorageNode.innerHTML = 'Total Drive Storage: ' + json['Used'] + '\\' + json['Total'];
    });

    //Create Weather
    var weatherContainer = document.createElement('div');
    var img              = document.createElement('img');
    var temperature      = document.createElement('p');
    var version          = element.parentElement.querySelector('#pUpToDate');

    weatherContainer.style = 'display:flex; margin:-1em';
    
    weatherContainer.appendChild(img);
    weatherContainer.appendChild(temperature);

    element.parentNode.insertBefore(weatherContainer, version.nextSibling);

    ApiClient.getJSON('/GetWeatherData').then((json) => {
        var weatherData = JSON.parse(json['weatherData']);
       
        img.setAttribute('src', 'https://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '.png');
        temperature.innerHTML = (json.units === 'celsius' ? Math.round(weatherData.main.temp) + "°C | " : Math.round(weatherData.main.temp) + "°F | ") +
            weatherData.weather[0].description + " | " + weatherData.name + " " + weatherData.sys.country;
    });


    upTimeCounter = setInterval(() => {
            console.log('update uptime');
            ApiClient.getJSON('/GetSystemUptimeData').then((json) => {
                upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeDays'] + ' Days ' + json['UpTimeHours'] + ' Hours';
            });
        ApiClient.getJSON('/GetWeatherData').then((json) => {
            var weatherData = JSON.parse(json['weatherData']);
            
            img.setAttribute('src', 'https://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '.png');
            temperature.innerHTML = (json.units === 'celsius' ? Math.round(weatherData.main.temp) + "°C | " : Math.round(weatherData.main.temp) + "°F | ") +
                weatherData.weather[0].description + " | " + weatherData.name + " " + weatherData.sys.country;
            });
        },
        60 * 60 * 60 * 20);
});




