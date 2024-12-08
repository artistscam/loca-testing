var div = document.getElementById('menu');

function menu() {
    if (div.classList.contains('show')) {
        div.classList.remove('show');
    } else {
        div.classList.add('show');
    }
}

function handleFormSubmit(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the selected value from the dropdown
    const role = document.getElementById('role').value;

    // Redirect based on the selected role
    if (role === 'auto_driver') {
        window.location.href = 'login_auto_driver.html';
    } else if (role === 'rider') {
        window.location.href = 'login_rider.html'; // Redirect to rider page
    }
    else {
        window.location.href = 'login_gateway.html'
    }
}


// Select the auto image
const autoLogo = document.querySelector('.auto-img');

// Add an event listener for scroll events
window.addEventListener('scroll', () => {
    // Get the current scroll position
    const scrollPosition = window.scrollY;

    // Calculate new position for the auto logo
    // Adjust the multiplier (e.g., 0.5) to control how fast it moves relative to scroll
    const newPosition = Math.max(0, window.innerWidth - (scrollPosition * 0.5));

    // Update the transform property to move the logo
    autoLogo.style.transform = `translateX(${newPosition}px)`;
});



document.addEventListener("DOMContentLoaded", function () {
    const infoTokens = document.querySelectorAll('.info-token-main');
    const newElements = document.querySelectorAll('.new-element'); // Change selector as needed

    // Function to count up
    function countUp(element, target) {
        let start = 0;
        const duration = 3000; // Duration in milliseconds
        const increment = Math.ceil(target / (duration / 100)); // Increment value

        const interval = setInterval(() => {
            start += increment;
            if (start >= target) {
                start = target;
                clearInterval(interval);
            }
            element.innerText = start + '+';
        }, 100);
    }

    // Intersection Observer for counting and newFunction
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                countUp(entry.target, target); // Trigger count up

                // Apply newFunction to the element if applicable
                if (entry.target.classList.contains('new-element')) {
                    newFunction(entry.target); // Call your new function here
                }

                observer.unobserve(entry.target); // Stop observing after processing
            }
        });
    });

    // Observe each info token
    infoTokens.forEach(token => {
        observer.observe(token);
    });

    // Observe each new element
    newElements.forEach(element => {
        observer.observe(element);
    });
});

document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const status = document.getElementById('status').value;

    try {
        const response = await fetch('/search-drivers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from, to, status })
        });

        const results = await response.json();
    
        const resultsList = document.getElementById('results');
        resultsList.innerHTML = '';

        if (results.length > 0) {
            results.forEach(driver => {
                const li = document.createElement('li');
                li.innerHTML = `<p><b>Name :</b> ${driver.name} <br><b>Auto-No. :</b> ${driver.autono} <br><b>Phone Number :</b> ${driver.phoneNumber} <br><b>Timing :</b> ${driver.timing} <br><b>Status :</b> ${driver.status}</p>`;
                resultsList.appendChild(li);
            });
        } else {
            resultsList.innerHTML = '<li>No Auto-drivers available.</li>';
        }
    } catch (error) {
        console.error('Error fetching drivers:', error);
    }
});

