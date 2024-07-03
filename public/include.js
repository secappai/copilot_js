function includeHTML() {
    var elements, element, file, xhttp;

    // Find all elements with 'nav' attribute
    elements = document.querySelectorAll('[nav]');
    
    elements.forEach(function(el) {
        file = el.getAttribute('nav');
        if (file) {
            // Make an HTTP request using the attribute value as the file name
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        el.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        el.innerHTML = 'Page not found.';
                    }
                }
            };
            xhttp.open('GET', file, true);
            xhttp.send();
        }
    });
}

// Call includeHTML after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    includeHTML();
});
