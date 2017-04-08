'user strict';

// load observations to div#puthere in index.html, load categories to navbar
const loadObservations = function(array, inputCategory = 'all') {

    if (inputCategory == 'all') {
        array.forEach((observation) => appendObservationDiv(observation));
    } else {
        array.filter((observation) => observation.category == inputCategory).
        forEach((observation) => appendObservationDiv(observation));
    }
    add_delete_listeners();
    add_update_listeners(array);

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
    document.getElementById("dropdown-menu").appendChild(z);
};

// create link for observation category
const template_category_button = (record) => {
    return `<a href="index.html?category=${record}">${record}</a>`;
}

const add_delete_listeners = () => {
    const classname = document.getElementsByClassName('deleteButton');
    const myFunction = function() {
        const id = this.getAttribute('data-id');
        $.ajax({
            type: 'DELETE',
            url: `/api/delete/${id}/`,
            success: () => {
                const parentDiv = this.parentElement.parentElement.parentElement;
                parentDiv.style.display = 'none'; // Hide
            },
        });
    };

    for (let i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', myFunction, false);
    }
};
const add_update_listeners = (events) => {
    const classname = document.getElementsByClassName('updateButton');
    const myFunction = function() {
        const id = this.getAttribute('data-id');
        const uEvent = events.find((event) => {
            return event._id == id;
        });
        loadObservation(uEvent.category, uEvent.title, uEvent.coordinates.lat, uEvent.coordinates.lng, uEvent.details, uEvent._id);
    };

    for (let i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', myFunction, false);
    }
};
// remake for 4 parameters, not an object, so it's reusable
const template_function = (record) => {
    return `   
    <div class = "col-sm-6 col-md-4">
        <img class="" src="${record.thumbnail}" >
        <div class = "caption">
            <h3>
                <a href="#">${record.title}</a> <p><small>${record.time}</small></p>    
            </h3>
            <p>${record.details}</p> 
            <p>
            <div class="btn-group btn-group-sm col-md-offset-3" role="group">
                <button data-image="${record.image}" href="#contact" onclick="openModalWindow(this)" 
                data-toggle="modal"  type="button" class="openmodal btn btn-primary" 
                data-coordinates-y="${record.coordinates.lng}" data-coordinates-x="${record.coordinates.lat}">Detail</button>
                <button  data-id="${record._id}" type="button" class="deleteButton btn btn-primary btn-md">Delete</button>
                <button data-id="${record._id}" type="button" class="updateButton btn btn-primary btn-md">Update</button>
            </div>
            </p>
        </div>
    </div>`;
}

function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

const loadObservation = (category, title, locationX, locationY, description, _id) => {
    eventFire(document.getElementById('createUpdateLink'), 'click');

    document.querySelector('input[name=category]').value = category;
    document.querySelector('input[name=title]').value = title;
    document.querySelector('input[name=locationX]').value = locationX;
    document.querySelector('input[name=locationY]').value = locationY;
    document.querySelector('textarea[name=description]').value = description;
    document.querySelector('input[name=updateCheckBox]').checked = true;
    document.querySelector('input[name=_id]').value = _id;

    const markerBig = new google.maps.Marker({
        position: new google.maps.LatLng(locationX, locationY),
        map: mapBig
    });
    document.getElementById("inputLocationX").value = locationX;
    document.getElementById("inputLocationY").value = locationY;


};