let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
const formContainer = document.getElementById('formContainer');
const showFormBtn = document.getElementById('showFormBtn');
const paymentTypeSelect = document.getElementById('paymentType');
const checkPaidContainer = document.getElementById('checkPaidContainer');
const lastNameInput = document.getElementById('lastName');
const noLastNameCheckbox = document.getElementById('noLastName');
const phoneInput = document.getElementById('phone');
const noPhoneCheckbox = document.getElementById('noPhone');
const addressInput = document.getElementById('address');
const previousAddressesSelect = document.getElementById('previousAddresses');
const jobForm = document.getElementById('jobForm');

let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('address'),
        {types: ['address']}
    );
    autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
    const place = autocomplete.getPlace();
    document.getElementById('address').value = place.formatted_address;
}

function toggleForm() {
    formContainer.classList.toggle('hidden');
    showFormBtn.textContent = formContainer.classList.contains('hidden') ? 'Add New Job' : 'Cancel';
}

function toggleCheckPaidField() {
    if (paymentTypeSelect.value === 'check') {
        checkPaidContainer.classList.remove('hidden');
    } else {
        checkPaidContainer.classList.add('hidden');
        document.getElementById('checkPaid').checked = false;
    }
}

function toggleLastNameField() {
    if (noLastNameCheckbox.checked) {
        lastNameInput.value = '';
        lastNameInput.disabled = true;
    } else {
        lastNameInput.disabled = false;
    }
}

function togglePhoneField() {
    if (noPhoneCheckbox.checked) {
        phoneInput.value = '';
        phoneInput.disabled = true;
    } else {
        phoneInput.disabled = false;
    }
}

function addJob(event) {
    event.preventDefault();
    console.log('Adding job...'); // Debug log

    const job = {
        firstName: document.getElementById('firstName').value,
        lastName: noLastNameCheckbox.checked ? 'N/A' : lastNameInput.value,
        phone: noPhoneCheckbox.checked ? 'N/A' : phoneInput.value,
        address: document.getElementById('address').value,
        cost: document.getElementById('cost').value,
        paymentType: paymentTypeSelect.value,
        serviceType: document.getElementById('serviceType').value,
        date: document.getElementById('jobDate').value
    };

    if (job.paymentType === 'check') {
        job.checkPaid = document.getElementById('checkPaid').checked;
    }

    console.log('Job object:', job); // Debug log

    jobs.push(job);
    saveJobs();
    updatePreviousAddresses();
    displayJobs();
    jobForm.reset();
    toggleForm();
    checkPaidContainer.classList.add('hidden');
    lastNameInput.disabled = false;
    phoneInput.disabled = false;

    console.log('Job added successfully'); // Debug log
}

function updatePreviousAddresses() {
    const addresses = [...new Set(jobs.map(job => job.address))];
    previousAddressesSelect.innerHTML = '<option value="">Select a previous address</option>';
    addresses.forEach(address => {
        const option = document.createElement('option');
        option.value = address;
        option.textContent = address;
        previousAddressesSelect.appendChild(option);
    });
    console.log('Previous addresses updated'); // Debug log
}

function loadPreviousAddress() {
    if (previousAddressesSelect.value) {
        addressInput.value = previousAddressesSelect.value;
        addressInput.disabled = true;
    } else {
        addressInput.disabled = false;
        addressInput.value = '';
    }
}

function displayJobs() {
    const jobList = document.getElementById('jobList');
    jobList.innerHTML = '';

    // Sort jobs by date, most recent first
    const sortedJobs = jobs.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedJobs.forEach((job, index) => {
        const li = document.createElement('li');
        li.className = 'job-item';
        li.innerHTML = `
            <div class="job-item-header">
                <div class="job-item-info">
                    <strong>${job.firstName} ${job.lastName}</strong> - ${job.date}
                </div>
                <button class="delete-btn">Delete</button>
            </div>
            <div class="job-item-details">
                <p class="full-width"><strong>Address:</strong> ${job.address}</p>
                <p><strong>Phone:</strong> ${job.phone}</p>
                <p><strong>Service:</strong> ${job.serviceType}</p>
                <p><strong>Cost:</strong> $${job.cost}</p>
                <p><strong>Payment:</strong> ${job.paymentType}${job.paymentType === 'check' ? (job.checkPaid ? ' (Paid)' : ' (Not Paid)') : ''}</p>
            </div>
        `;
        
        const deleteButton = li.querySelector('.delete-btn');
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent the click from triggering the job item expansion
            deleteJob(index);
        };
        
        li.onclick = () => {
            li.classList.toggle('expanded');
        };
        
        jobList.appendChild(li);
    });
}

function openGoogleMaps(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
}

function deleteJob(index) {
    jobs.splice(index, 1);
    saveJobs();
    displayJobs();
}

function saveJobs() {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    console.log('Jobs saved:', jobs); // Debug log
}

showFormBtn.addEventListener('click', toggleForm);
jobForm.addEventListener('submit', addJob);
paymentTypeSelect.addEventListener('change', toggleCheckPaidField);
noLastNameCheckbox.addEventListener('change', toggleLastNameField);
noPhoneCheckbox.addEventListener('change', togglePhoneField);
previousAddressesSelect.addEventListener('change', loadPreviousAddress);

updatePreviousAddresses();
displayJobs();

google.maps.event.addDomListener(window, 'load', initAutocomplete);