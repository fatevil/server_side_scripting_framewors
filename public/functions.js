const functionOne = function (array, inputCategory = 'all') {

    if (inputCategory == 'all') {
        array.forEach(function (element) {
            const z = document.createElement('div');
            z.innerHTML = template_function(element);
            document.getElementById("puthere").appendChild(z);

        }, this);

    } else {
        array.filter(a => a.category == inputCategory).forEach(function (element) {
            var z = document.createElement('div');
            z.innerHTML = template_function(element);
            document.getElementById("puthere").appendChild(z);

        }, this);
    }

    let unique = [...new Set(array.map(a => a.category))];

    unique.forEach(function (element) {
        var z = document.createElement('li');
        z.innerHTML = template_category_button(element);
        document.getElementById("topbar").appendChild(z);

    }, this);
};


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
                    <a href="#">${record.title}</a> <small>${record.time }</small>
                </h3>
                <p>${record.details}</p>
<a class="openmodal" data-coordinates-y="${record.coordinates.lng}" data-coordinates-x="${record.coordinates.lat}"  
onclick="openModalWindow(this)" data-image="${record.image}"  href="#contact" data-toggle="modal" >Detail</a>
            
            </div>`;
}