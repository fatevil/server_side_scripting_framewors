 "use strict";
 const fetchData = () => {

     return fetch('http://localhost:8080/data/data.json').then((response) => {
         // Yay, `j` is a JavaScript object
         return response;
     });

 }