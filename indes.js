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
                <div class="job-item-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="map-btn">Map</button>
                    <button class="download-btn">Download</button>
                    <button class="delete-btn">Delete</button>
                </div>
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

        const mapButton = li.querySelector('.map-btn');
        mapButton.onclick = (e) => {
            e.stopPropagation(); // Prevent the click from triggering the job item expansion
            openGoogleMaps(job.address);
        };
        
        const downloadButton = li.querySelector('.download-btn');
        downloadButton.onclick = (e) => {
            e.stopPropagation();
            downloadJobInfo(job);
        };
        
        const editButton = li.querySelector('.edit-btn');
        editButton.onclick = (e) => {
            e.stopPropagation();
            editJob(index);
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

function editJob(index) {
    const job = jobs[index];
    
    // Populate the form with the job details
    document.getElementById('firstName').value = job.firstName;
    lastNameInput.value = job.lastName === 'N/A' ? '' : job.lastName;
    noLastNameCheckbox.checked = job.lastName === 'N/A';
    toggleLastNameField();
    
    phoneInput.value = job.phone === 'N/A' ? '' : job.phone;
    noPhoneCheckbox.checked = job.phone === 'N/A';
    togglePhoneField();
    
    document.getElementById('address').value = job.address;
    document.getElementById('cost').value = job.cost;
    paymentTypeSelect.value = job.paymentType;
    document.getElementById('serviceType').value = job.serviceType;
    document.getElementById('jobDate').value = job.date;
    
    if (job.paymentType === 'check') {
        checkPaidContainer.classList.remove('hidden');
        document.getElementById('checkPaid').checked = job.checkPaid;
    } else {
        checkPaidContainer.classList.add('hidden');
    }
    
    // Show the form
    formContainer.classList.remove('hidden');
    showFormBtn.textContent = 'Cancel';
    
    // Change the form submit button to "Update Job"
    const submitButton = jobForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Job';
    
    // Remove the existing submit event listener
    jobForm.removeEventListener('submit', addJob);
    
    // Add a new submit event listener for updating the job
    jobForm.onsubmit = (event) => {
        event.preventDefault();
        updateJob(index);
    };
}

function updateJob(index) {
    const updatedJob = {
        firstName: document.getElementById('firstName').value,
        lastName: noLastNameCheckbox.checked ? 'N/A' : lastNameInput.value,
        phone: noPhoneCheckbox.checked ? 'N/A' : phoneInput.value,
        address: document.getElementById('address').value,
        cost: document.getElementById('cost').value,
        paymentType: paymentTypeSelect.value,
        serviceType: document.getElementById('serviceType').value,
        date: document.getElementById('jobDate').value
    };

    if (updatedJob.paymentType === 'check') {
        updatedJob.checkPaid = document.getElementById('checkPaid').checked;
    }

    jobs[index] = updatedJob;
    saveJobs();
    updatePreviousAddresses();
    displayJobs();
    jobForm.reset();
    toggleForm();
    
    // Reset the form submit button and event listener
    const submitButton = jobForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Add Job';
    jobForm.onsubmit = addJob;
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

function downloadJobInfo(job) {
    const jobDetails = `
===============================
        GRASS CUTTERS JOB
===============================

Customer Information:
---------------------
Name:     ${job.firstName} ${job.lastName}
Phone:    ${job.phone}
Address:  ${job.address}

Job Details:
------------
Date:     ${job.date}
Service:  ${job.serviceType}
Cost:     $${job.cost}

Payment Information:
--------------------
Type:     ${job.paymentType}
${job.paymentType === 'check' ? `Status:   ${job.checkPaid ? 'Paid' : 'Not Paid'}` : ''}

===============================
        IMPORTANT NOTES
===============================
1. Please arrive on time
2. Bring all necessary equipment
3. Contact customer if running late
4. Ensure quality service

===============================
   Thank you for your business!
===============================
    `.trim();

    const blob = new Blob([jobDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Job_${job.firstName}_${job.lastName}_${job.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}