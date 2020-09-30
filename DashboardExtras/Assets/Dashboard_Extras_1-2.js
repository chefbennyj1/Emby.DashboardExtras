
(function (win) {
    
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

                check();
            });
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true
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


function getWeatherIcon(weatherData) {
    
    var time = new Date().getTime();
    var now = Math.floor(time / 1000);
    
    switch (weatherData.weather[0].main) {
        case "Mist":
        case "Fog":
	case "Haze":
            return "fog";
        case "Clear":
            return now < weatherData.sys.sunset && now > weatherData.sys.sunrise ? "sunny" : "night";
        case "Clouds":
            switch (weatherData.weather[0].description.toLowerCase()) {
                case "overcast clouds":
                    return "cloudy";
                default:
                    return now < weatherData.sys.sunset && now > weatherData.sys.sunrise ? "partly_cloudy" : "night_partly_cloudy";
            }  
        case "Snow":
            switch (weatherData.weather[0].description.toLowerCase())
            {
                case "heavy snow":
                    return "snow_heavy";
                case "rain and snow":
                    return "snowy_rainy";
                default:
                    return "snowy";
            } 
        case "Rain":
            switch (weatherData.weather[0].description.toLowerCase()) {
                case "very heavy rain":
                case "shower rain":
                    return "pouring";
                case "light rain":
                    return "rainy";
                default:
                    return "pouring";
            } 
        case "Thunderstorm":
            switch (weatherData.weather[0].description.toLowerCase()) {
                case "heavy thunderstorm":
                    return "lightning";
                default:
                    return "lightning_rainy";
            }
        case "Drizzle":
            return "partly_rainy";
        case "Tornado":
            return "tornado";

    } 

}

var backgroundContainer = document.querySelector('.backgroundContainer');
var networkGraph;

function getWeatherSvgHtml() {
    var html = '';
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="cloudy"><path style="fill:darkgray" d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="cloudy_alert"><path style="fill:darkgray" d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13M13,12H11V8H13V12M13,16H11V14H13" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="fog"><path style="fill:darkgray" d="M3,15H13A1,1 0 0,1 14,16A1,1 0 0,1 13,17H3A1,1 0 0,1 2,16A1,1 0 0,1 3,15M16,15H21A1,1 0 0,1 22,16A1,1 0 0,1 21,17H16A1,1 0 0,1 15,16A1,1 0 0,1 16,15M1,12A5,5 0 0,1 6,7C7,4.65 9.3,3 12,3C15.43,3 18.24,5.66 18.5,9.03L19,9C21.19,9 22.97,10.76 23,13H21A2,2 0 0,0 19,11H17V10A5,5 0 0,0 12,5C9.5,5 7.45,6.82 7.06,9.19C6.73,9.07 6.37,9 6,9A3,3 0 0,0 3,12C3,12.35 3.06,12.69 3.17,13H1.1L1,12M3,19H5A1,1 0 0,1 6,20A1,1 0 0,1 5,21H3A1,1 0 0,1 2,20A1,1 0 0,1 3,19M8,19H21A1,1 0 0,1 22,20A1,1 0 0,1 21,21H8A1,1 0 0,1 7,20A1,1 0 0,1 8,19Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="hail"><path style="fill:darkgray" d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14M10,18A2,2 0 0,1 12,20A2,2 0 0,1 10,22A2,2 0 0,1 8,20A2,2 0 0,1 10,18M14.5,16A1.5,1.5 0 0,1 16,17.5A1.5,1.5 0 0,1 14.5,19A1.5,1.5 0 0,1 13,17.5A1.5,1.5 0 0,1 14.5,16M10.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,15A1.5,1.5 0 0,1 9,13.5A1.5,1.5 0 0,1 10.5,12Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="hazy"><path style="fill:darkgray" d="M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64M14,15A1,1 0 0,0 13,14H3A1,1 0 0,0 2,15A1,1 0 0,0 3,16H13A1,1 0 0,0 14,15M22,15A1,1 0 0,0 21,14H17A1,1 0 0,0 16,15A1,1 0 0,0 17,16H21A1,1 0 0,0 22,15M10,19A1,1 0 0,0 11,20H20A1,1 0 0,0 21,19A1,1 0 0,0 20,18H11A1,1 0 0,0 10,19M3,19A1,1 0 0,0 4,20H7A1,1 0 0,0 8,19A1,1 0 0,0 7,18H4A1,1 0 0,0 3,19M12,9A3,3 0 0,1 15,12H17A5,5 0 0,0 12,7A5,5 0 0,0 7,12H9A3,3 0 0,1 12,9Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="hurricane"><path style="fill:darkgray" d="M15,6.79C16.86,7.86 18,9.85 18,12C18,22 6,22 6,22C7.25,21.06 8.38,19.95 9.34,18.71C9.38,18.66 9.41,18.61 9.44,18.55C9.69,18.06 9.5,17.46 9,17.21C7.14,16.14 6,14.15 6,12C6,2 18,2 18,2C16.75,2.94 15.62,4.05 14.66,5.29C14.62,5.34 14.59,5.39 14.56,5.45C14.31,5.94 14.5,6.54 15,6.79M12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="lightning"><path style="fill:darkgray" d="M6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14H7A1,1 0 0,1 8,15A1,1 0 0,1 7,16H6M12,11H15L13,15H15L11.25,22L12,17H9.5L12,11Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="lightning_rainy"><path style="fill:darkgray" d="M4.5,13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.44 4,15.6 3.5,15.33V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16A1,1 0 0,1 18,15A1,1 0 0,1 19,14A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59M9.5,11H12.5L10.5,15H12.5L8.75,22L9.5,17H7L9.5,11M17.5,18.67C17.5,19.96 16.5,21 15.25,21C14,21 13,19.96 13,18.67C13,17.12 15.25,14.5 15.25,14.5C15.25,14.5 17.5,17.12 17.5,18.67Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="night"><path style="fill:darkgray" d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="night_partly_cloudy"><path style="fill:darkgray" d="M22,10.28C21.74,10.3 21.5,10.31 21.26,10.31C19.32,10.31 17.39,9.57 15.91,8.09C14.25,6.44 13.5,4.19 13.72,2C13.77,1.53 13.22,1 12.71,1C12.57,1 12.44,1.04 12.32,1.12C12,1.36 11.66,1.64 11.36,1.94C9.05,4.24 8.55,7.66 9.84,10.46C8.31,11.11 7.13,12.43 6.69,14.06L6,14A4,4 0 0,0 2,18A4,4 0 0,0 6,22H19A3,3 0 0,0 22,19A3,3 0 0,0 19,16C18.42,16 17.88,16.16 17.42,16.45L17.5,15.5C17.5,15.28 17.5,15.05 17.46,14.83C19.14,14.67 20.77,13.94 22.06,12.64C22.38,12.34 22.64,12 22.88,11.68C23.27,11.13 22.65,10.28 22.04,10.28M19,18A1,1 0 0,1 20,19A1,1 0 0,1 19,20H6A2,2 0 0,1 4,18A2,2 0 0,1 6,16H8.5V15.5C8.5,13.94 9.53,12.64 10.94,12.18C11.1,12.13 11.26,12.09 11.43,12.06C11.61,12.03 11.8,12 12,12C12.23,12 12.45,12.03 12.66,12.07C12.73,12.08 12.8,12.1 12.87,12.13C13,12.16 13.15,12.2 13.28,12.25C13.36,12.28 13.44,12.32 13.5,12.36C13.63,12.41 13.74,12.47 13.84,12.54C13.92,12.59 14,12.64 14.07,12.7C14.17,12.77 14.25,12.84 14.34,12.92C14.41,13 14.5,13.05 14.55,13.12C14.63,13.2 14.69,13.29 14.76,13.37C14.82,13.45 14.89,13.53 14.94,13.62C15,13.71 15.04,13.8 15.09,13.9C15.14,14 15.2,14.08 15.24,14.18C15.41,14.59 15.5,15.03 15.5,15.5V18M16.83,12.86C15.9,11.16 14.08,10 12,10H11.87C11.41,9.19 11.14,8.26 11.14,7.29C11.14,6.31 11.39,5.37 11.86,4.55C12.21,6.41 13.12,8.14 14.5,9.5C15.86,10.88 17.58,11.79 19.45,12.14C18.66,12.6 17.76,12.84 16.83,12.86Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="partly_cloudy"><path style="fill:darkgray" d="M12.74,5.47C15.1,6.5 16.35,9.03 15.92,11.46C17.19,12.56 18,14.19 18,16V16.17C18.31,16.06 18.65,16 19,16A3,3 0 0,1 22,19A3,3 0 0,1 19,22H6A4,4 0 0,1 2,18A4,4 0 0,1 6,14H6.27C5,12.45 4.6,10.24 5.5,8.26C6.72,5.5 9.97,4.24 12.74,5.47M11.93,7.3C10.16,6.5 8.09,7.31 7.31,9.07C6.85,10.09 6.93,11.22 7.41,12.13C8.5,10.83 10.16,10 12,10C12.7,10 13.38,10.12 14,10.34C13.94,9.06 13.18,7.86 11.93,7.3M13.55,3.64C13,3.4 12.45,3.23 11.88,3.12L14.37,1.82L15.27,4.71C14.76,4.29 14.19,3.93 13.55,3.64M6.09,4.44C5.6,4.79 5.17,5.19 4.8,5.63L4.91,2.82L7.87,3.5C7.25,3.71 6.65,4.03 6.09,4.44M18,9.71C17.91,9.12 17.78,8.55 17.59,8L19.97,9.5L17.92,11.73C18.03,11.08 18.05,10.4 18,9.71M3.04,11.3C3.11,11.9 3.24,12.47 3.43,13L1.06,11.5L3.1,9.28C3,9.93 2.97,10.61 3.04,11.3M19,18H16V16A4,4 0 0,0 12,12A4,4 0 0,0 8,16H6A2,2 0 0,0 4,18A2,2 0 0,0 6,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="partly_lightning"><path style="fill:darkgray" d="M19,15C18.65,15 18.31,15.06 18,15.17V15C18,13.19 17.19,11.56 15.92,10.46C16.35,8.03 15.1,5.5 12.75,4.47C9.97,3.24 6.72,4.5 5.5,7.25C4.6,9.24 5,11.45 6.27,13H6A4,4 0 0,0 2,17A4,4 0 0,0 6,21H7C7,21 8,21 8,20C8,19 7,19 7,19H6A2,2 0 0,1 4,17A2,2 0 0,1 6,15H8A4,4 0 0,1 12,11A4,4 0 0,1 16,15V17H19A1,1 0 0,1 20,18A1,1 0 0,1 19,19H17C17,19 16,19 16,20C16,21 17,21 17,21H19A3,3 0 0,0 22,18A3,3 0 0,0 19,15M12,9C10.16,9 8.5,9.83 7.41,11.13C6.93,10.22 6.85,9.09 7.31,8.07C8.09,6.31 10.16,5.5 11.93,6.3C13.18,6.86 13.94,8.06 14,9.34C13.38,9.12 12.7,9 12,9M13.55,2.63C13,2.4 12.45,2.23 11.88,2.12L14.37,0.82L15.27,3.71C14.76,3.29 14.19,2.93 13.55,2.63M6.09,3.44C5.6,3.79 5.17,4.19 4.8,4.63L4.91,1.82L7.87,2.5C7.25,2.71 6.65,3.03 6.09,3.44M18,8.71C17.91,8.12 17.78,7.55 17.59,7L19.97,8.5L17.92,10.73C18.03,10.08 18.05,9.4 18,8.71M3.04,10.3C3.11,10.9 3.25,11.47 3.43,12L1.06,10.5L3.1,8.28C3,8.93 2.97,9.61 3.04,10.3M11.8,15H14.25L12.61,18.27H14.25L11.18,24L11.8,19.91H9.75" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="partly_rainy"><path style="fill:darkgray" d="M12.75,4.47C15.1,5.5 16.35,8.03 15.92,10.46C17.19,11.56 18,13.19 18,15V15.17C18.31,15.06 18.65,15 19,15A3,3 0 0,1 22,18A3,3 0 0,1 19,21H17C17,21 16,21 16,20C16,19 17,19 17,19H19A1,1 0 0,0 20,18A1,1 0 0,0 19,17H16V15A4,4 0 0,0 12,11A4,4 0 0,0 8,15H6A2,2 0 0,0 4,17A2,2 0 0,0 6,19H7C7,19 8,19 8,20C8,21 7,21 7,21H6A4,4 0 0,1 2,17A4,4 0 0,1 6,13H6.27C5,11.45 4.6,9.24 5.5,7.25C6.72,4.5 9.97,3.24 12.75,4.47M11.93,6.3C10.16,5.5 8.09,6.31 7.31,8.07C6.85,9.09 6.93,10.22 7.41,11.13C8.5,9.83 10.16,9 12,9C12.7,9 13.38,9.12 14,9.34C13.94,8.06 13.18,6.86 11.93,6.3M13.55,2.63C13,2.4 12.45,2.23 11.88,2.12L14.37,0.82L15.27,3.71C14.76,3.29 14.19,2.93 13.55,2.63M6.09,3.44C5.6,3.79 5.17,4.19 4.8,4.63L4.91,1.82L7.87,2.5C7.25,2.71 6.65,3.03 6.09,3.44M18,8.71C17.91,8.12 17.78,7.55 17.59,7L19.97,8.5L17.92,10.73C18.03,10.08 18.05,9.4 18,8.71M3.04,10.3C3.11,10.9 3.25,11.47 3.43,12L1.06,10.5L3.1,8.28C3,8.93 2.97,9.61 3.04,10.3M12,18.91C12.59,19.82 13,20.63 13,21A1,1 0 0,1 12,22A1,1 0 0,1 11,21C11,20.63 11.41,19.82 12,18.91M12,15.62C12,15.62 9,19 9,21A3,3 0 0,0 12,24A3,3 0 0,0 15,21C15,19 12,15.62 12,15.62Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="partly_snowy"><path style="fill:darkgray" d="M6,19.03A2,2 0 0,1 4,17.03C4,15.92 4.9,15.03 6,15.03H8C8,12.81 9.79,11.03 12,11.03A4,4 0 0,1 16,15.03V17.03H19A1,1 0 0,1 20,18.03C20,18.57 19.55,19.03 19,19.03H17C17,19.03 16,19.03 16,20.03C16,21.03 17,21.03 17,21.03H19A3,3 0 0,0 22,18.03C22,16.37 20.66,15.03 19,15.03C18.65,15.03 18.31,15.08 18,15.19V15.03C18,13.21 17.19,11.58 15.92,10.5C16.35,8.05 15.1,5.53 12.75,4.5C9.97,3.27 6.72,4.53 5.5,7.28C4.6,9.27 5,11.47 6.27,13.03H6C3.79,13.03 2,14.81 2,17.03A4,4 0 0,0 6,21.03C6,21.03 7,21.03 7,20.03C7,19.03 6,19.03 6,19.03M12,9.03C10.16,9.03 8.5,9.85 7.41,11.16C6.93,10.25 6.85,9.11 7.31,8.09C8.09,6.33 10.16,5.53 11.93,6.32C13.18,6.89 13.94,8.08 14,9.37C13.38,9.15 12.7,9.03 12,9.03M13.55,2.66C13,2.42 12.45,2.26 11.88,2.15L14.37,0.84L15.27,3.73C14.76,3.31 14.19,2.95 13.55,2.66M6.09,3.46C5.6,3.81 5.17,4.21 4.8,4.66L4.91,1.84L7.87,2.53C7.25,2.73 6.65,3.05 6.09,3.46M18,8.73C17.91,8.15 17.78,7.57 17.59,7.03L19.97,8.53L17.92,10.76C18.03,10.1 18.05,9.42 18,8.73M3.04,10.32C3.11,10.92 3.25,11.5 3.43,12.03L1.06,10.53L3.1,8.3C3,8.95 2.97,9.64 3.04,10.32M8.03,21.45C8.13,21.84 8.53,22.06 8.91,21.96L10.5,21.54L10.06,23.11C9.96,23.5 10.19,23.9 10.57,24C10.95,24.1 11.35,23.87 11.45,23.5L11.87,21.91L13.03,23.07C13.3,23.35 13.77,23.35 14.05,23.07C14.33,22.79 14.33,22.32 14.05,22.05L12.89,20.88L14.47,20.47C14.85,20.37 15.08,19.97 15,19.59C14.88,19.21 14.5,19 14.09,19.08L12.5,19.5L12.94,17.93C13.04,17.54 12.82,17.15 12.43,17.05C12.05,16.95 11.66,17.17 11.55,17.56L11.14,19.14L10,17.97C9.7,17.69 9.23,17.69 8.95,17.97C8.68,18.27 8.68,18.72 8.95,19L10.11,20.16L8.54,20.57C8.15,20.68 7.93,21.07 8.03,21.45Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="partly_snowy_rainy"><path style="fill:darkgray" d="M13.55,2.66C13,2.42 12.45,2.26 11.88,2.15L14.37,0.84L15.27,3.73C14.76,3.31 14.19,2.95 13.55,2.66M6.09,3.46C5.6,3.81 5.17,4.21 4.8,4.66L4.91,1.84L7.87,2.53C7.25,2.73 6.65,3.05 6.09,3.46M18,8.73C17.91,8.15 17.78,7.57 17.59,7.03L19.97,8.53L17.92,10.76C18.03,10.1 18.05,9.42 18,8.73M3.04,10.32C3.11,10.92 3.25,11.5 3.43,12.03L1.06,10.53L3.1,8.3C3,8.95 2.97,9.64 3.04,10.32M16.68,22.21C16.68,23.2 15.91,24 14.95,24C14,24 13.23,23.2 13.23,22.21C13.23,21.03 14.95,19.03 14.95,19.03C14.95,19.03 16.68,21.03 16.68,22.21M6.03,21.45C5.93,21.07 6.15,20.68 6.54,20.58L8.13,20.15L6.96,19C6.68,18.72 6.68,18.27 6.96,18C7.23,17.7 7.7,17.7 8,18L9.14,19.14L9.55,17.56C9.65,17.17 10.05,16.94 10.43,17.05C10.82,17.15 11.05,17.55 10.93,17.93L10.5,19.5L12.1,19.1C12.5,19 12.88,19.21 13,19.6C13.08,19.97 12.86,20.37 12.47,20.47L10.89,20.89L12.05,22.05C12.33,22.32 12.33,22.79 12.05,23.07C11.77,23.35 11.31,23.35 11.03,23.07L9.87,21.9L9.45,23.5C9.35,23.88 8.95,24.1 8.57,24C8.18,23.9 7.97,23.5 8.06,23.12L8.5,21.55L6.91,21.96C6.5,22.06 6.13,21.84 6.03,21.45M19,15.03C18.65,15.03 18.31,15.08 18,15.19V15.03C18,13.21 17.19,11.58 15.92,10.5C16.35,8.05 15.1,5.53 12.75,4.5C9.97,3.27 6.72,4.53 5.5,7.28C4.6,9.27 5,11.47 6.27,13.03H6C3.79,13.03 2,14.81 2,17.03C2,18.17 2.5,19.2 3.27,19.93V19.93C3.27,19.93 3.97,20.64 4.68,19.93C5.39,19.22 4.68,18.5 4.68,18.5C4.27,18.15 4,17.62 4,17.03C4,15.92 4.9,15.03 6,15.03H8C8,12.81 9.79,11.03 12,11.03A4,4 0 0,1 16,15.03V17.03H19A1,1 0 0,1 20,18.03C20,18.57 19.55,19.03 19,19.03H18C18,19.03 17,19.03 17,20.03C17,21.03 18,21.03 18,21.03H19A3,3 0 0,0 22,18.03C22,16.37 20.66,15.03 19,15.03M12,9.03C10.16,9.03 8.5,9.85 7.41,11.16C6.93,10.25 6.85,9.11 7.31,8.09C8.09,6.33 10.16,5.53 11.93,6.32C13.18,6.89 13.94,8.08 14,9.37C13.38,9.15 12.7,9.03 12,9.03Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="snow_heavy"><path style="fill:darkgray" d="M4,16.36C3.86,15.82 4.18,15.25 4.73,15.11L7,14.5L5.33,12.86C4.93,12.46 4.93,11.81 5.33,11.4C5.73,11 6.4,11 6.79,11.4L8.45,13.05L9.04,10.8C9.18,10.24 9.75,9.92 10.29,10.07C10.85,10.21 11.17,10.78 11,11.33L10.42,13.58L12.67,13C13.22,12.83 13.79,13.15 13.93,13.71C14.08,14.25 13.76,14.82 13.2,14.96L10.95,15.55L12.6,17.21C13,17.6 13,18.27 12.6,18.67C12.2,19.07 11.54,19.07 11.15,18.67L9.5,17L8.89,19.27C8.75,19.83 8.18,20.14 7.64,20C7.08,19.86 6.77,19.29 6.91,18.74L7.5,16.5L5.26,17.09C4.71,17.23 4.14,16.92 4,16.36M1,10A5,5 0 0,1 6,5C7,2.65 9.3,1 12,1C15.43,1 18.24,3.66 18.5,7.03L19,7A4,4 0 0,1 23,11A4,4 0 0,1 19,15A1,1 0 0,1 18,14A1,1 0 0,1 19,13A2,2 0 0,0 21,11A2,2 0 0,0 19,9H17V8A5,5 0 0,0 12,3C9.5,3 7.45,4.82 7.06,7.19C6.73,7.07 6.37,7 6,7A3,3 0 0,0 3,10C3,10.85 3.35,11.61 3.91,12.16C4.27,12.55 4.26,13.16 3.88,13.54C3.5,13.93 2.85,13.93 2.47,13.54C1.56,12.63 1,11.38 1,10M14.03,20.43C14.13,20.82 14.5,21.04 14.91,20.94L16.5,20.5L16.06,22.09C15.96,22.5 16.18,22.87 16.57,22.97C16.95,23.08 17.35,22.85 17.45,22.46L17.86,20.89L19.03,22.05C19.3,22.33 19.77,22.33 20.05,22.05C20.33,21.77 20.33,21.3 20.05,21.03L18.89,19.86L20.46,19.45C20.85,19.35 21.08,18.95 20.97,18.57C20.87,18.18 20.5,17.96 20.09,18.06L18.5,18.5L18.94,16.91C19.04,16.5 18.82,16.13 18.43,16.03C18.05,15.92 17.65,16.15 17.55,16.54L17.14,18.11L15.97,16.95C15.7,16.67 15.23,16.67 14.95,16.95C14.67,17.24 14.67,17.7 14.95,17.97L16.11,19.14L14.54,19.55C14.15,19.65 13.92,20.05 14.03,20.43Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="pouring"><path style="fill:darkgray" d="M9,12C9.53,12.14 9.85,12.69 9.71,13.22L8.41,18.05C8.27,18.59 7.72,18.9 7.19,18.76C6.65,18.62 6.34,18.07 6.5,17.54L7.78,12.71C7.92,12.17 8.47,11.86 9,12M13,12C13.53,12.14 13.85,12.69 13.71,13.22L11.64,20.95C11.5,21.5 10.95,21.8 10.41,21.66C9.88,21.5 9.56,20.97 9.7,20.43L11.78,12.71C11.92,12.17 12.47,11.86 13,12M17,12C17.53,12.14 17.85,12.69 17.71,13.22L16.41,18.05C16.27,18.59 15.72,18.9 15.19,18.76C14.65,18.62 14.34,18.07 14.5,17.54L15.78,12.71C15.92,12.17 16.47,11.86 17,12M17,10V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.43 4,15.6 3.5,15.32V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12C23,13.5 22.2,14.77 21,15.46V15.46C20.5,15.73 19.91,15.57 19.63,15.09C19.36,14.61 19.5,14 20,13.72V13.73C20.6,13.39 21,12.74 21,12A2,2 0 0,0 19,10H17Z" /></symbol></svg>';
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="rainy"><path style="fill:darkgray" d="M6,14.03A1,1 0 0,1 7,15.03C7,15.58 6.55,16.03 6,16.03C3.24,16.03 1,13.79 1,11.03C1,8.27 3.24,6.03 6,6.03C7,3.68 9.3,2.03 12,2.03C15.43,2.03 18.24,4.69 18.5,8.06L19,8.03A4,4 0 0,1 23,12.03C23,14.23 21.21,16.03 19,16.03H18C17.45,16.03 17,15.58 17,15.03C17,14.47 17.45,14.03 18,14.03H19A2,2 0 0,0 21,12.03A2,2 0 0,0 19,10.03H17V9.03C17,6.27 14.76,4.03 12,4.03C9.5,4.03 7.45,5.84 7.06,8.21C6.73,8.09 6.37,8.03 6,8.03A3,3 0 0,0 3,11.03A3,3 0 0,0 6,14.03M12,14.15C12.18,14.39 12.37,14.66 12.56,14.94C13,15.56 14,17.03 14,18C14,19.11 13.1,20 12,20A2,2 0 0,1 10,18C10,17.03 11,15.56 11.44,14.94C11.63,14.66 11.82,14.4 12,14.15M12,11.03L11.5,11.59C11.5,11.59 10.65,12.55 9.79,13.81C8.93,15.06 8,16.56 8,18A4,4 0 0,0 12,22A4,4 0 0,0 16,18C16,16.56 15.07,15.06 14.21,13.81C13.35,12.55 12.5,11.59 12.5,11.59" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="snowy"><path style="fill:darkgray" d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14M7.88,18.07L10.07,17.5L8.46,15.88C8.07,15.5 8.07,14.86 8.46,14.46C8.85,14.07 9.5,14.07 9.88,14.46L11.5,16.07L12.07,13.88C12.21,13.34 12.76,13.03 13.29,13.17C13.83,13.31 14.14,13.86 14,14.4L13.41,16.59L15.6,16C16.14,15.86 16.69,16.17 16.83,16.71C16.97,17.24 16.66,17.79 16.12,17.93L13.93,18.5L15.54,20.12C15.93,20.5 15.93,21.15 15.54,21.54C15.15,21.93 14.5,21.93 14.12,21.54L12.5,19.93L11.93,22.12C11.79,22.66 11.24,22.97 10.71,22.83C10.17,22.69 9.86,22.14 10,21.6L10.59,19.41L8.4,20C7.86,20.14 7.31,19.83 7.17,19.29C7.03,18.76 7.34,18.21 7.88,18.07Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="snowy_rainy"><path style="fill:darkgray" d="M18.5,18.67C18.5,19.96 17.5,21 16.25,21C15,21 14,19.96 14,18.67C14,17.12 16.25,14.5 16.25,14.5C16.25,14.5 18.5,17.12 18.5,18.67M4,17.36C3.86,16.82 4.18,16.25 4.73,16.11L7,15.5L5.33,13.86C4.93,13.46 4.93,12.81 5.33,12.4C5.73,12 6.4,12 6.79,12.4L8.45,14.05L9.04,11.8C9.18,11.24 9.75,10.92 10.29,11.07C10.85,11.21 11.17,11.78 11,12.33L10.42,14.58L12.67,14C13.22,13.83 13.79,14.15 13.93,14.71C14.08,15.25 13.76,15.82 13.2,15.96L10.95,16.55L12.6,18.21C13,18.6 13,19.27 12.6,19.67C12.2,20.07 11.54,20.07 11.15,19.67L9.5,18L8.89,20.27C8.75,20.83 8.18,21.14 7.64,21C7.08,20.86 6.77,20.29 6.91,19.74L7.5,17.5L5.26,18.09C4.71,18.23 4.14,17.92 4,17.36M1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16A1,1 0 0,1 18,15A1,1 0 0,1 19,14A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,11.85 3.35,12.61 3.91,13.16C4.27,13.55 4.26,14.16 3.88,14.54C3.5,14.93 2.85,14.93 2.47,14.54C1.56,13.63 1,12.38 1,11Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="sunny"><path style="fill:darkgray" d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="sunny_alert"><path style="fill:darkgray" d="M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56M19,13V7H21V13H19M19,17V15H21V17" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="sunset"><path style="fill:darkgray" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M5,16H19A1,1 0 0,1 20,17A1,1 0 0,1 19,18H5A1,1 0 0,1 4,17A1,1 0 0,1 5,16M17,20A1,1 0 0,1 18,21A1,1 0 0,1 17,22H7A1,1 0 0,1 6,21A1,1 0 0,1 7,20H17M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="sunset_down"><path style="fill:darkgray" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,20.71L15.82,17.6C16.21,17.21 16.21,16.57 15.82,16.18C15.43,15.79 14.8,15.79 14.41,16.18L12,18.59L9.59,16.18C9.2,15.79 8.57,15.79 8.18,16.18C7.79,16.57 7.79,17.21 8.18,17.6L11.29,20.71C11.5,20.9 11.74,21 12,21C12.26,21 12.5,20.9 12.71,20.71Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="sunset_up"><path style="fill:darkgray" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.8,21.21 14.41,20.82L12,18.41L9.59,20.82C9.2,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="tornado"><path style="fill:darkgray" d="M21,5H3A1,1 0 0,1 2,4A1,1 0 0,1 3,3H21A1,1 0 0,1 22,4A1,1 0 0,1 21,5M20,8A1,1 0 0,0 19,7H5A1,1 0 0,0 4,8A1,1 0 0,0 5,9H19A1,1 0 0,0 20,8M21,12A1,1 0 0,0 20,11H10A1,1 0 0,0 9,12A1,1 0 0,0 10,13H20A1,1 0 0,0 21,12M16,16A1,1 0 0,0 15,15H9A1,1 0 0,0 8,16A1,1 0 0,0 9,17H15A1,1 0 0,0 16,16M13,20A1,1 0 0,0 12,19H10A1,1 0 0,0 9,20A1,1 0 0,0 10,21H12A1,1 0 0,0 13,20Z" /></symbol></svg>'
    html += '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="windy"><path style="fill:darkgray" d="M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z" /></symbol></svg>'
    return html;
}

function getGpuSvgHtml() {
    return '<svg width="24" height="24"><symbol style="fill: #141414; stroke:none" viewbox="0 0 24 24" id="gpu"><path style="fill:darkgray" d="M2,7V8.5H3V17H4.5V7C3.7,7 2.8,7 2,7M6,7V7L6,16H7V17H14V16H22V7H6M17.5,9A2.5,2.5 0 0,1 20,11.5A2.5,2.5 0 0,1 17.5,14A2.5,2.5 0 0,1 15,11.5A2.5,2.5 0 0,1 17.5,9Z"/></symbol></svg>';
}

function createNetworkChart(info, chartCanvas, Chart) {
   
        var ctx = chartCanvas.getContext("2d");
        return new Chart(ctx,
            {
                type: 'horizontalBar',
                data: {
                    labels: [new Date().getSeconds()],
                    datasets: [
                        {
                            label: 'Download Speed',
                            borderColor: "#4584b5",
                            fill: false,
                            data: info != null ? info.NetworkInterface.BytesSent :0
                        }, {
                            label: 'Upload Speed',
                            borderColor: "#D4AF37",
                            fill: false,
                            data: info != null ? info.NetworkInterface.BytesReceived : 0
                        }
                    ]
                }
            });
    
}


ready('body', (element) => {
    element.innerHTML += getWeatherSvgHtml();
    element.innerHTML += getGpuSvgHtml();
}); 

//Add UpTime, Weather and Drive Space to the Dashboard
var upTimeCounter;
ready(".localUrl", (element) => {

    clearInterval(upTimeCounter);
    var upTimeNode,
        totalStorageNode,
        svgWeatherUseElement, temperature,
        cpuStat,
        gpuStat, svgGpuUseElement;

    ApiClient.getJSON('/EnabledExtras').then((extras) => {
         
        
        if (extras.UpTimeEnabled === true) {
            // Create a the upTime Element
            upTimeNode = document.createElement('p');
            upTimeNode.id = 'upTime';
            // Insert the upTime node before the #localUrl node
            element.parentNode.insertBefore(upTimeNode, element);
            ApiClient.getJSON('/GetSystemUptimeData').then((json) => {
                if (json['UpTimeDays'] === "0" && json['UpTimeHours'] === "0") {
                    upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeMinutes'] + ' Minute(s) ' + json['UpTimeSeconds'] + ' Second(s)';
                    return;
                }
                if (json['UpTimeDays'] === "0") {
                    upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeHours'] + ' Hour(s) ' + json['UpTimeMinutes'] + ' Minute(s)';
                    return;
                }
                upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeDays'] + ' Day(s) ' + json['UpTimeHours'] + ' Hour(s)';
            });
        } 

        var powerButton = document.querySelector('button.btnRestartMenu');
        var icon = powerButton.querySelector('i');
        icon.style.display = "none";
        powerButton.innerHTML = '<svg style="width:40px;height:40px" viewBox="0 0 24 24"><path fill="currentColor" d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13"/></svg>';
        powerButton.querySelector('svg').style.transition = "5s";
        
        powerButton.addEventListener('mouseenter', () => {
            powerButton.innerHTML = '<svg style="width:40px;height:40px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M13,17H11V7H13V17Z" /></svg>';
        });

        powerButton.addEventListener('mouseleave', () => {
            powerButton.innerHTML = '<svg style="width:40px;height:40px" viewBox="0 0 24 24"><path fill="currentColor" d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13"/></svg>'; 
        });

        if (extras.BackgroundBlur === true) {
            //Blur backgrounds on dialog open
            var blurObserver = new MutationObserver((mutations) => {
                try {
                    var backgroundContainer = document.querySelector('.dialogBackdropOpened');
                    var backdropContainer   = document.querySelector('.backdropContainer ')
                    var drawer              = document.querySelector('.mainDrawer');
                    var mainAnimatedPages   = document.querySelector('.mainAnimatedPages');
                    var skinHeader          = document.querySelector('.skinHeader');

                    if (document.querySelector('.dialogBackdropOpened')) {
                        backgroundContainer.style.opacity = 0;
                        drawer.style.filter               = "blur(8px)";
                        mainAnimatedPages.style.filter    = "blur(8px)";
                        skinHeader.style.filter           = "blur(8px)";
                        backdropContainer.style.filter    = "blur(8px)";
                        return;

                    } else if (!document.querySelector('.dialogBackdropOpened')) { 
                        drawer.style.filter            = "blur(0)";
                        mainAnimatedPages.style.filter = "blur(0)";
                        skinHeader.style.filter        = "blur(0)";
                        backdropContainer.style.filter = "blur(0)";
                        return;
                    }
                } catch (error) { }
            });
            blurObserver.observe(document, {
                childList        : true,
                subtree          : true,
                attributes       : true,
                attributeOldValue: true
            });
        }

        if (extras.StorageEnabled === true) {
            totalStorageNode    = document.createElement('p');
            totalStorageNode.id = 'totalStorage';
            element.parentNode.insertBefore(totalStorageNode, element);
            ApiClient.getJSON('/GetTotalStorage').then((json) => {
                totalStorageNode.innerHTML = 'Total Drive Storage: ' + json['Used'] + '\\' + json['Total'];
            });
        } 

        if (extras.WeatherEnabled === true) {
            //Create Weather
            var weatherContainer = document.createElement('div');
            var weatherSvg       = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgWeatherUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            temperature          = document.createElement('p');
            var version          = element.parentElement.querySelector('#pUpToDate');

            weatherContainer.style = 'display:flex; margin:-1em';

            weatherSvg.style.height = '25px';
            weatherSvg.style.width  = '25px';
            weatherSvg.style.margin = '0.95em 0.9em';

            weatherSvg.appendChild(svgWeatherUseElement);

            weatherContainer.appendChild(weatherSvg);
            weatherContainer.appendChild(temperature);

            element.parentNode.insertBefore(weatherContainer, version.nextSibling);

            try {
                ApiClient.getJSON('/GetWeatherData').then((json) => {
                    var weatherData = JSON.parse(json['weatherData']);
                    svgWeatherUseElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + getWeatherIcon(weatherData));
                    temperature.innerHTML = (json.units === 'celsius'
                            ? Math.round(weatherData.main.temp) + "°C | "
                            : Math.round(weatherData.main.temp) + "°F | ") +
                        weatherData.weather[0].description +
                        " | " +
                        weatherData.name +
                        " " +
                        weatherData.sys.country;
                });
            } catch (err) {
                temperature.innerHTML = "Open plugin settings to access weather data.";
            }
        }
        
    });

    upTimeCounter = setInterval(() => {
        ApiClient.getJSON('/EnabledExtras').then((extras) => {
            console.log('update uptime & weather data');

            if (extras.UpTimeEnabled === true) {
                ApiClient.getJSON('/GetSystemUptimeData').then((json) => {
                    if (json['UpTimeDays'] === "0" && json['UpTimeHours'] === "0") {
                        upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeMinutes'] + ' Minute(s) ' + json['UpTimeSeconds'] + ' Second(s)';
                        return;
                    }
                    if (json['UpTimeDays'] === "0") {
                        upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeHours'] + ' Hour(s) ' + json['UpTimeMinutes'] + ' Minute(s)';
                        return;
                    }
                    upTimeNode.innerHTML = 'Up Time: ' + json['UpTimeDays'] + ' Day(s) ' + json['UpTimeHours'] + ' Hour(s)';
                });
            }

            if (extras.WeatherEnabled === true) {
                ApiClient.getJSON('/GetWeatherData').then((json) => {
                    var weatherData = JSON.parse(json['weatherData']);
                    svgWeatherUseElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + getWeatherIcon(weatherData));
                    temperature.innerHTML = (json.units === 'celsius'
                            ? Math.round(weatherData.main.temp) + "°C | "
                            : Math.round(weatherData.main.temp) + "°F | ") +
                        weatherData.weather[0].description +
                        " | " +
                        weatherData.name +
                        " " +
                        weatherData.sys.country;
                });
            } 
        });
    }, 60 * 60 * 10);
});




