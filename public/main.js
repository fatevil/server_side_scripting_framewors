 'use strict';

 // get content from URL a parse it as JSON
 const fetchJsonFromUrl = (url) => {
     return fetch(new Request(url, {
         method: 'GET',
     })).then((response) => {
         return response.json();
     }).catch((e) => {
         console.log(e);
     });
 };


 // get JSON from localhost 
 const response = fetchJsonFromUrl('api/events').then(function(response) {
     const getCategory = window.location.search.substr(1).split('=');
     if (getCategory.length == 2) {
         loadObservations(response, getCategory[1]);
     } else {
         loadObservations(response);
     }
 });