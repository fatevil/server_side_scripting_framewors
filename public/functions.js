'user strict';

// load observations to div#puthere in index.html, load categories to navbar
const loadObservations = function(array, inputCategory = 'all') {

    if (inputCategory == 'all') {
        array.forEach((observation) => appendObservationDiv(observation));
    } else {
        array.filter((observation) => observation.category == inputCategory).
        forEach((observation) => appendObservationDiv(observation));
    }

    let unique = [...new Set(array.map((a) => a.category))];

    unique.forEach((category) => appendCategoryToNavbar(category));
};

// create div with observation details
const appendObservationDiv = (observation) => {
    const z = document.createElement('div');
    z.innerHTML = template_function(observation);
    document.getElementById("puthere").appendChild(z);
};

// create link for observation category
const appendCategoryToNavbar = (category) => {
    const z = document.createElement('li');
    z.innerHTML = template_category_button(category);
    document.getElementById("topbar").appendChild(z);
};

// create link for observation category
const template_category_button = (record) => {
    return `<a href="index.html?category=${record}">${record}</a>`;
}


// remake for 4 parameters, not an object, so it's reusable
const template_function = (record) => {
    return `
            <div class="col-md-4 portfolio-item">
                <a href="#">
                 <img class="img-responsive" src="${record.thumbnail}" alt="">
                </a>
                <h3>
                    <a href="#">${record.title}</a> <p><small>${record.time}</small></p>    
                </h3>
                <p>${record.details}</p>
<a class="openmodal" data-coordinates-y="${record.coordinates.lng}" data-coordinates-x="${record.coordinates.lat}"  
onclick="openModalWindow(this)" data-image="${record.image}"  href="#contact" data-toggle="modal" >Detail</a>
            
            </div>`;
}