'user strict';

// load observations to div#puthere in index.html, load categories to navbar
const loadObservations = function(array) {
    //console.log(array);
    if (array == null) {
        console.log("empty result");
    } else {
        array.forEach((observation) => appendObservationDiv(observation));

        add_delete_listeners();
        add_update_listeners(array);
    }


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
const template_category_button = (category) => {
    return `<a href="index.html?category=${category}">${category}</a>`;
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

const loadObservation = (category, title, locationX, locationY, details, _id) => {
    console.log("loading observation");
    eventFire(document.getElementById('createUpdateLink'), 'click');

    document.querySelector('input[name=category]').value = category;
    document.querySelector('input[name=title]').value = title;
    document.querySelector('input[name=locationX]').value = locationX;
    document.querySelector('input[name=locationY]').value = locationY;
    document.querySelector('textarea[name=details]').value = details;
    document.querySelector('input[name=updateCheckBox]').checked = true;
    document.querySelector('input[name=_id]').value = _id;

    const markerBig = new google.maps.Marker({
        position: new google.maps.LatLng(locationX, locationY),
        map: mapBig
    });
    document.getElementById("inputLocationX").value = locationX;
    document.getElementById("inputLocationY").value = locationY;


};

document.querySelector('form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    let url;
    let request;

    if (formData.has('updateCheckBox')) {
        request = {
            method: 'PATCH',
            body: formData,
        };
        url = '/api/update';
        console.log('update');
    } else {
        request = {
            method: 'POST',
            body: formData,
        };
        url = '/api/create';
        console.log('create');
    }
    fetch(url, request).then((resp) => {
        console.log(resp);
        window.location.href = `index.html`;
    });
});

document.querySelector('#searchFilterButton').addEventListener('click', (evt) => {
    const entry = $("#searchFilterButton").data('entry');
    const value = $("#searchTextInput").val();

    window.location.href = `index.html?${entry}=${value}`;
});

$(".dropdown-menu li a").click(function() {
    $("#filterButton:first-child").text($(this).text());
    $("#searchFilterButton").data('entry', $(this).text());
});