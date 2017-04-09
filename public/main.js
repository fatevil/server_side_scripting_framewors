 'use strict';

 // get content from URL a parse it as JSON
 const fetchJsonFromUrl = (url) => {
     return fetch(new Request(url, {
         method: 'GET',
     })).then((response) => {
         return response.json();
     }).then((response) => {
         //console.log(response);
         return response;
     }).catch((e) => {
         console.log(e);
     });
 };

 const param = window.location.search.substr(1).split('=');
 let url;
 if (param.length >= 2) {
     url = `api/read/${param[0]}/${param[1]}`;
 } else {
     url = `api/read/`;
 }
 fetchJsonFromUrl(url).then((response) => {
     loadObservations(response);
 });

 fetchJsonFromUrl('api/categories/read').then((response) => new Set(response).forEach((object) => appendCategoryToNavbar(object.category)));