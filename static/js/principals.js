let prinId = 0;
let contactList = [];

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('panelToggle');
    const filterPanel = document.getElementById('filterPanel');
    const filterContent = document.getElementById('filterContent');
    const mainPanel = document.getElementById('mainPanel');
    const toggleIcon = document.getElementById('toggleIcon');
    let isExpanded = true;

    toggleButton.addEventListener('click', function() {
        if (isExpanded) {
            // Collapse the filter panel
            filterPanel.classList.remove('w-1/5');
            filterPanel.classList.add('w-[2.5%]');
            filterContent.classList.add('hidden');
            mainPanel.classList.remove('w-[97.5%]');
            mainPanel.classList.add('w-full');
            toggleIcon.textContent = 'chevron_right';
        } else {
            // Expand the filter panel
            filterPanel.classList.remove('w-[2.5%]');
            filterContent.classList.remove('hidden');
            filterPanel.classList.add('w-1/5');
            mainPanel.classList.remove('w-full');
            mainPanel.classList.add('w-4/5');
            toggleIcon.textContent = 'chevron_left';
        }
        isExpanded = !isExpanded;
    });

    const closeViewPrincipalButton = document.getElementById('closePanelButton');
    closeViewPrincipalButton.addEventListener('click', function() {
        document.getElementById('rightFilterPanel').classList.add('hidden');
        document.getElementById('addPrincipalButton').classList.remove('hidden');
    });

    const closeNewPrincipalButton = document.getElementById('nclosePanelButton');
    closeNewPrincipalButton.addEventListener('click', function() {
        document.getElementById('newPrincipalPanel').classList.add('hidden');
        document.getElementById('addPrincipalButton').classList.remove('hidden');
    });
});

document.querySelectorAll('.principal-name').forEach(function (elem) {
    elem.addEventListener('click', function () {
        prinId = 0;
        contactList = [];

        var principalId = elem.getAttribute('data-principal-id');
        prinId = principalId;

        openPrincipal();
    });
});

function openPrincipal() {

    if (!document.getElementById('newPrincipalPanel').classList.contains('hidden')) {
        document.getElementById('newPrincipalPanel').classList.add('hidden');
        document.getElementById('addPrincipalButton').classList.remove('hidden');
    }

    // Fetch the details of the principal from the backend
    fetch(`/get-principal-details/${prinId}`)
    .then(response => response.json())
    .then(data => {
            console.log(data);
            const utcDate = new Date(data.principal.lastUpdated); // Input: UTC time

            // Define the offset for Australia/Melbourne in hours (UTC+11 in December, due to daylight saving time)
            const melbourneOffset = 11 * 60; // Convert hours to minutes

            // Get the UTC time in milliseconds and add the Melbourne offset
            const melbourneTime = new Date(utcDate.getTime() + melbourneOffset * 60 * 1000);

            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // Use 24-hour time
            };
                  
            const formattedDate = new Intl.DateTimeFormat('en-AU', options).format(melbourneTime);

            // Utility function to format floats
            function formatFloat(value) {
                const floatValue = parseFloat(value) || 0; // Convert to float, default to 0 if invalid
                return floatValue.toFixed(2); // Format to 2 decimal places
            }

            // Update fields with formatted values
            document.getElementById('principalName').value = data.principal.name;
            document.getElementById('principalOrigin').value = data.principal.originCountry;
            document.getElementById('activeShipments').value = data.principal.activeShipments;
            document.getElementById('principalTier').value = data.principal.tier;
            document.getElementById('agencyAgreement').value = data.principal.agencyAgreement;
            document.getElementById('importFee').value = formatFloat(data.principal.importFee);
            document.getElementById('importFeeCurrency').value = data.principal.importFeeCurrency;
            document.getElementById('exportFeeTNL').value = formatFloat(data.principal.exportFeeTNL);
            document.getElementById('exportFeeTNLCurrency').value = data.principal.exportFeeTNLCurrency;
            document.getElementById('exportFeeAGT').value = formatFloat(data.principal.exportFeeAGT);
            document.getElementById('exportFeeAGTCurrency').value = data.principal.exportFeeAGTCurrency;
            document.getElementById('mtRepoFee').value = formatFloat(data.principal.mtRepoFee);
            document.getElementById('mtRepoFeeCurrency').value = data.principal.mtRepoFeeCurrency;
            document.getElementById('demurrageCommission').value = formatFloat(data.principal.demurrageCommission);
            document.getElementById('principalNotes').value = data.principal.notes;
            document.getElementById('principalHidden').checked = data.principal.isHidden;
            document.getElementById('principalArchived').checked = data.principal.isArchived;
            document.getElementById('lastUpdated').innerHTML = "Last Updated: " + formattedDate;
            document.getElementById('lastUpdated').dataset.lastUpdated = data.principal.lastUpdated;

                // Create dynamic contact items
            const contactsContainer = document.querySelector('.contacts-container');
            contactsContainer.innerHTML = ''; // Clear any previous content

            if (data.contacts != null) {
                data.contacts.forEach(contact => {
                    contactList.push(contact);
                    const contactItem = document.createElement('div');
                    contactItem.classList.add('block', 'overflow-hidden', 'contact-item', 'p-0', 'relative');       
    
                    const contactHTML = `
                            <button onclick="deleteContact(this, ${contact.id})" class="deleteContactButton z-10 absolute right-[0.75rem] top-[calc(25%_-_0.75rem)] bg-[#FFF] border border-i-link-light rounded-full p-2 shadow-md hover:bg-[#f16a61] transition ease-in-out duration-500 h-6 w-6 flex items-center justify-center" title="Delete Contact">
                                <span class="material-icons text-i-link text-sm transition ease-in-out duration-500">clear</span>
                            </button>

                            <div class="flex border-b border-l border-r border-i-link-light">
                                <p class="px-4 py-2 w-1/2 bg-[#F9F9F9] border-r border-i-link-light text-i-link inter-600">${contact.name}</p>
                                <p class="px-4 py-2 w-1/2 bg-[#F9F9F9] text-i-link inter-600">${contact.position}</p>
                            </div>
                            <div class="flex border-l border-r border-b border-i-link-light">
                                <div class="relative flex items-center w-1/2 h-[40px] bg-[#FFFFFF] border-r border-i-link-light text-[#00000088] text-sm">
                                    <input
                                        type="text"
                                        value="${contact.phone}"
                                        class="truncate pl-2 pr-10 w-full h-full bg-transparent border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500"
                                        readonly
                                    />
                                    <button
                                        class="absolute right-2 text-white p-1 rounded hover:text-i-blue-hover transition ease-in-out duration-500"
                                        title="Copy Phone"
                                        onclick="copyText('${contact.phone}')">
                                        <span class="material-icons text-sm">content_copy</span>
                                    </button>
                                </div>
                                <div class="relative flex items-center w-1/2 h-[40px] bg-[#FFFFFF] border-i-link-light text-[#00000088] text-sm">
                                    <input
                                        type="text"
                                        value="${contact.email}"
                                        class="truncate pl-2 pr-10 w-full h-full bg-transparent border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500"
                                        readonly                                    
                                    />
                                    <button
                                        class="absolute right-2 text-white p-1 rounded hover:text-i-blue-hover transition ease-in-out duration-500"
                                        title="Copy Email"
                                        onclick="copyText('${contact.email}')">
                                        <span class="material-icons text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        `;
    
                    contactItem.innerHTML = contactHTML;
                    contactsContainer.appendChild(contactItem);
                });
            } else {
                const contactItem = document.createElement('div');
                const contactHTML = `
                        <p class="text-center text-i-link inter-600">No contacts created</p>
                `
                contactItem.innerHTML = contactHTML;
                contactsContainer.appendChild(contactItem);
            }

            // Show the right panel
            document.getElementById('rightFilterPanel').classList.remove('hidden');
            document.getElementById('rightFilterPanel').style.right = "0";
            document.getElementById('addPrincipalButton').classList.add('hidden');

            // Prevent body scroll when the panel is open
            document.body.style.overflow = 'hidden';
    })
    .catch(err => console.error('Error fetching principal details:', err));
}

document.getElementById('addContactButton').addEventListener('click', function() {
    const contactsContainer = document.querySelector('.contacts-container');

    // Check if there's a div containing a p element (e.g., "No contacts created")
    const noContactsDiv = Array.from(contactsContainer.children).find(div => 
        div.querySelector('p') && div.querySelector('p').textContent.trim() === "No contacts created"
    );
    if (noContactsDiv) {
        console.log(noContactsDiv);
        contactsContainer.removeChild(noContactsDiv);
    }

    const contactItem = document.createElement('div');
    contactItem.classList.add('block', 'overflow-hidden', 'contact-item', 'p-0', 'relative');

    const contactHTML = `
        <div class="z-10 absolute right-[0.75rem] top-[calc(25%_-_0.75rem)] flex">
            <button onclick="deleteTempContact(this)" class="deleteContactButton bg-[#FFF] border border-i-link-light rounded-full p-2 shadow-md hover:bg-[#f16a61] transition ease-in-out duration-500 h-6 w-6 flex items-center justify-center" title="Delete Contact">
                <span class="material-icons text-i-link text-sm transition ease-in-out duration-500">clear</span>
            </button>

            <button onclick="saveTempContact(this)" class="saveContactButton ml-2 bg-[#FFF] border border-i-link-light rounded-full p-2 shadow-md hover:bg-[#61b16a] transition ease-in-out duration-500 h-6 w-6 flex items-center justify-center" title="Save Contact">
                <span class="material-icons text-i-link text-sm transition ease-in-out duration-500">check</span>
            </button>
        </div>



        <!-- Contact Fields -->
        <div class="flex border-b border-l border-r border-i-link-light">
            <div class="relative flex items-center w-1/2 h-[40px] border-r border-i-link-light text-[#00000088] text-sm">
                <input
                    type="text"
                    placeholder="Name"
                    class="nameInput truncate pl-2 pr-10 w-full h-full bg-[#F9F9F9] border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500 placeholder:text-i-link-light"
                />
            </div>
            <div class="relative flex items-center w-1/2 h-[40px] border-i-link-light text-[#00000088] text-sm">
                <input
                    type="text"
                    placeholder="Position"
                    class="positionInput truncate pl-2 pr-10 w-full h-full bg-[#F9F9F9] border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500 placeholder:text-i-link-light"
                />
            </div>
        </div>
        <div class="flex border-l border-r border-b border-i-link-light">
            <div class="relative flex items-center w-1/2 h-[40px] bg-[#FFFFFF] border-r border-i-link-light text-[#00000088] text-sm">
                <input
                    type="text"
                    placeholder="Phone Number"
                    class="phoneInput truncate pl-2 pr-10 w-full h-full bg-transparent border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500 placeholder:text-i-link-light"
                />
            </div>
            <div class="relative flex items-center w-1/2 h-[40px] bg-[#FFFFFF] border-i-link-light text-[#00000088] text-sm">
                <input
                    type="text"
                    placeholder="Email"
                    class="emailInput truncate pl-2 pr-10 w-full h-full bg-transparent border-none text-[#00000088] text-sm focus:outline-none focus:ring-1 focus:ring-i-link focus:border-i-link transition ease-in-out duration-500 placeholder:text-i-link-light"
                />
            </div>
        </div>
    `;

    contactItem.innerHTML = contactHTML;
    contactsContainer.appendChild(contactItem);
});


function deleteTempContact(button) {
    const contactItem = button.closest('.contact-item');
    if (contactItem) {
        contactItem.remove();
    }
};

function saveTempContact(button) {
    // Find the parent contact item of the Save button
    const contactItem = button.closest('.contact-item');

    if (contactItem) {
        // Get the input values from the contact item
        const name = contactItem.querySelector('.nameInput');
        const position = contactItem.querySelector('.positionInput');
        const phone = contactItem.querySelector('.phoneInput');
        const email = contactItem.querySelector('.emailInput');
        const addButton = contactItem.querySelector('.saveContactButton');

        // Convert input values to strings (ensures they are strings)
        const nameStr = String(name.value.trim());
        const positionStr = String(position.value.trim());
        const phoneStr = String(phone.value.trim());
        const emailStr = String(email.value.trim());

        if (nameStr != "") {
            let new_contact = {
                name: nameStr,
                position: positionStr,
                phone: phoneStr,
                email: emailStr,
                principal: Number(prinId),
                new: Number(1)
            }
            contactList.push(new_contact);
            name.setAttribute("readonly", "");
            position.setAttribute("readonly", "");
            phone.setAttribute("readonly", "");
            email.setAttribute("readonly", "");
            addButton.classList.remove("flex");
            addButton.classList.add("hidden");
        } else {
            alert("Name cannot be empty");
        }
    }
};

document.getElementById('principalDetailsBtn').addEventListener('click', function() {
    // Show the Principal Details panel and hide the Contacts panel
    document.getElementById('principalDetailsPanel').classList.remove('hidden');
    document.getElementById('contactsPanel').classList.add('hidden');

    // Update button styling
    // Remove active styles from both buttons
    document.getElementById('principalDetailsBtn').classList.add('bg-[#F3F3F3]', 'shadow', 'cursor-default');
    document.getElementById('principalDetailsBtn').classList.remove('hover:bg-[#eeeeee]');

    document.getElementById('contactsBtn').classList.remove('bg-[#F3F3F3]', 'shadow', 'cursor-default');
    document.getElementById('contactsBtn').classList.add('cursor-pointer', 'hover:bg-[#eeeeee]');
});

document.getElementById('contactsBtn').addEventListener('click', function() {
    // Show the Contacts panel and hide the Principal Details panel
    document.getElementById('contactsPanel').classList.remove('hidden');
    document.getElementById('principalDetailsPanel').classList.add('hidden');

    // Update button styling
    // Remove active styles from both buttons
    document.getElementById('contactsBtn').classList.add('bg-[#F3F3F3]', 'shadow', 'cursor-default');
    document.getElementById('contactsBtn').classList.remove('hover:bg-[#eeeeee]');

    document.getElementById('principalDetailsBtn').classList.remove('bg-[#F3F3F3]', 'shadow', 'cursor-default');
    document.getElementById('principalDetailsBtn').classList.add('cursor-pointer', 'hover:bg-[#eeeeee]');
});

document.querySelectorAll('.highlight-table input').forEach(input => {
    input.addEventListener('focus', (event) => {
        const td = event.target.closest('td');
        if (td) {
            td.style.backgroundColor = '#efefef'; // Highlight color
        }
    });

    input.addEventListener('blur', (event) => {
        const td = event.target.closest('td');
        if (td) {
            td.style.backgroundColor = 'transparent'; // Reset to transparent
        }
    });
});

document.getElementById('savePrincipalButton').addEventListener('click', function() {
    const tier = document.getElementById('principalTier').value;
    const agreement = document.getElementById('agencyAgreement').value;
    const impfee = document.getElementById('importFee').value;
    const impfeeCurrency = document.getElementById('importFeeCurrency').value;
    const expfeeTNL = document.getElementById('exportFeeTNL').value;
    const expfeeTNLCurrency = document.getElementById('exportFeeTNLCurrency').value;
    const expfeeAGT = document.getElementById('exportFeeAGT').value;
    const expfeeAGTCurrency = document.getElementById('exportFeeAGTCurrency').value;
    const mtRepo = document.getElementById('mtRepoFee').value;
    const mtRepoCurrency = document.getElementById('mtRepoFeeCurrency').value;
    const demComm = document.getElementById('demurrageCommission').value;
    const notes = document.getElementById('principalNotes').value;
    const isHidden = document.getElementById('principalHidden').checked;
    const isArchived = document.getElementById('principalArchived').checked;

    const lastUpdated = document.getElementById('lastUpdated').dataset.lastUpdated;
    const savePanel = document.getElementById('filter-overlay');

    fetch(`/get-principal-details/${prinId}`)
    .then(response => response.json())
    .then(data => {
        let fetchedPrinUpdated = data.principal.lastUpdated;
        let savedPrinUpdated = lastUpdated;
            
        if (fetchedPrinUpdated != savedPrinUpdated) {
            document.getElementById("rightFilterPanel-content").classList.add("blur");
            savePanel.classList.remove("hidden");
            savePanel.classList.add("flex");
        } else {
            // do saving
            savePrincipal(tier, agreement, impfee, impfeeCurrency, expfeeTNL, expfeeTNLCurrency, expfeeAGT, expfeeAGTCurrency, mtRepo, mtRepoCurrency, demComm, notes, isHidden, isArchived);
        }
    })
    .catch(err => console.error('Error fetching principal details:', err));
});

function savePrincipal(tier, agreement, impfee, impfeeCurrency, expfeeTNL, expfeeTNLCurrency, expfeeAGT, expfeeAGTCurrency, mtRepo, mtRepoCurrency, demComm, notes, isHidden, isArchived) {
    fetch(`/save_principal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            id: prinId, 
            tier: tier, 
            agreement: agreement, 
            impfee: impfee, 
            impfeeCurrency: impfeeCurrency, 
            expfeeTNL: expfeeTNL, 
            expfeeTNLCurrency: expfeeTNLCurrency, 
            expfeeAGT: expfeeAGT, 
            expfeeAGTCurrency: expfeeAGTCurrency, 
            mtRepo: mtRepo, 
            mtRepoCurrency: mtRepoCurrency, 
            demComm: demComm,  
            notes: notes,
            isHidden: isHidden,
            isArchived: isArchived,
            contacts: contactList 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert("Principal Information Updated!");
        const savePanel = document.getElementById('filter-overlay');
        document.getElementById("rightFilterPanel-content").classList.remove("blur");
        savePanel.classList.remove("flex");
        savePanel.classList.add("hidden");
        location.reload();
    })
    .catch(error => {
        alert('Failed to save principal. Please try again.');
    });
}

document.getElementById('save-cancel').addEventListener('click', function() {
    const savePanel = document.getElementById('filter-overlay');
    document.getElementById("rightFilterPanel-content").classList.remove("blur");
    savePanel.classList.remove("flex");
    savePanel.classList.add("hidden");
});

document.getElementById('save-refresh').addEventListener('click', function() {
    openPrincipal();

    const savePanel = document.getElementById('filter-overlay');
    document.getElementById("rightFilterPanel-content").classList.remove("blur");
    savePanel.classList.remove("flex");
    savePanel.classList.add("hidden");
});

document.getElementById('save-overwrite').addEventListener('click', function() {
    const tier = document.getElementById('principalTier').value;
    const agreement = document.getElementById('agencyAgreement').value;
    const impfee = document.getElementById('importFee').value;
    const impfeeCurrency = document.getElementById('importFeeCurrency').value;
    const expfeeTNL = document.getElementById('exportFeeTNL').value;
    const expfeeTNLCurrency = document.getElementById('exportFeeTNLCurrency').value;
    const expfeeAGT = document.getElementById('exportFeeAGT').value;
    const expfeeAGTCurrency = document.getElementById('exportFeeAGTCurrency').value;
    const mtRepo = document.getElementById('mtRepoFee').value;
    const mtRepoCurrency = document.getElementById('mtRepoFeeCurrency').value;
    const demComm = document.getElementById('demurrageCommission').value;
    const notes = document.getElementById('principalNotes').value;
    const isHidden = document.getElementById('principalHidden').checked;
    const isArchived = document.getElementById('principalArchived').checked;

    savePrincipal(tier, agreement, impfee, impfeeCurrency, expfeeTNL, expfeeTNLCurrency, expfeeAGT, expfeeAGTCurrency, mtRepo, mtRepoCurrency, demComm, notes, isHidden, isArchived);
})


document.getElementById("filterSearchButton").addEventListener("click", (event) => {
    event.preventDefault();
    applyFilters();
});

document.getElementById("filterClearButton").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("clearing");
    clearFilters();
});


function applyFilters() {
    const filterInputs = document.getElementById('filterPanel').querySelectorAll("input, select");

    const filters = {};
    filterInputs.forEach((input) => {
        if (input.type === "checkbox") {
            // For checkboxes, use `checked` property
            filters[input.name] = input.checked ? "True" : "False"; // Or any convention you prefer
        } else {
            filters[input.name] = input.value.trim();
        }
    });

    console.log(filters);

    const principals = document.getElementById("principalTableList").querySelectorAll(".principal"); // Assume each principal has class 'principal'

    principals.forEach((principal) => {
        let isVisible = true;

        console.log(principal);

        // Check all filters
        for (const [key, value] of Object.entries(filters)) {
            const principalValue = principal.dataset[key];

            if (key === "name") {
                if (value !== "" && !principalValue.toLowerCase().startsWith(value.toLowerCase())) {
                    isVisible = false;
                }
            }
            else if (key === "tier") {
                if (value !== "" && !principalValue.toLowerCase().startsWith(value.toLowerCase())) {
                    isVisible = false;
                }
            }
            else if (key === "agreement") {
                console.log(value + " " + principalValue)
                const normalizedValue = value.toLowerCase() === "yes";
                const normalizedPrincipalValue = principalValue.toLowerCase() === "true";

                if (value !== "both" && normalizedValue !== normalizedPrincipalValue) {
                    isVisible = false;
                }
            }
            else if (key === "demurrage") {
                if (value !== "" && !principalValue.toLowerCase().startsWith(value.toLowerCase())) {
                    isVisible = false;
                }
            }
            else if (key === "origin") {
                if (value !== "all" && value !== principalValue) {
                    isVisible = false;
                }
            }
            else if (key === "hidden") {
                if (value === "False" && principalValue === "True") {
                    isVisible = false;
                }
            }
            else if (key === "archived") {
                if (value === "False" && principalValue === "True") {
                    isVisible = false;
                }
            }

            if (!isVisible) break;
        }

        principal.style.display = isVisible ? principal.classList.remove("hidden") : principal.classList.add("hidden");
    });
};


function clearFilters() {
    const name = document.getElementById("name");
    const tier = document.getElementById("tier");
    const agreement = document.getElementById("agencyDropdown");
    const demurrage = document.getElementById("demurrage");
    const origin = document.getElementById("originDropdown");
    const isHidden = document.getElementById("hiddenPrincipals");
    const isArchived = document.getElementById("archivedPrincipals");

    name.value = "";
    tier.value = "";
    agreement.value = "both";
    demurrage.value = "";
    origin.value = "all";
    isHidden.checked = false;
    isArchived.checked = false;

    const principals = document.getElementById("principalTableList").querySelectorAll(".principal");
    principals.forEach((principal) => {
        if (principal.dataset["hidden"] !== "True" && principal.dataset["archived"] !== "True") {
            principal.style.display = principal.classList.remove("hidden");
        } else {
            principal.style.display = principal.classList.add("hidden");
        }
    });
};

function formatImportFeeOnBlur(event) {
    let value = event.target.value.trim();

    // If the input is empty, set it to '0.00'
    if (value === "") {
        event.target.value = "0.00";
        return;
    }

    // Remove any non-numeric characters except for the decimal point
    value = value.replace(/[^0-9.]/g, "");

    // Ensure there's only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts[1]; // Keep only the first two parts
    }

    // Round to two decimal places if there are more than two decimals
    if (parts.length === 2) {
        parts[1] = parts[1].substring(0, 2); // Keep only two decimal digits
        value = parts.join(".");
    }

    // If there's no decimal, append ".00"
    if (!value.includes(".")) {
        value += ".00";
    } else if (value.split(".")[1].length === 1) {
        value += "0"; // Add a zero to make it two decimal places
    }

    // Update the input value with the formatted string
    event.target.value = value;
};

const feeInputs = document.querySelectorAll(".fee-input");
feeInputs.forEach(input => {
    input.addEventListener("blur", formatImportFeeOnBlur); // Listen for blur (when the user clicks off)
});

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
    }).catch(err => {
        console.error('Failed to copy text:', err);
    });
};

function deleteContact(el, id) {
    const index = contactList.findIndex(contact => contact.id === id);

    if (index !== -1) {
        contactList[index]['deleted'] = 1;
        el.closest('.contact-item').classList.add("hidden");
    }
};


document.getElementById('addPrincipalButton').addEventListener("click", function() {
    document.getElementById('newPrincipalPanel').classList.remove('hidden');
    document.getElementById('newPrincipalPanel').style.right = "0";
    document.getElementById('addPrincipalButton').classList.add('hidden');

    // Prevent body scroll when the panel is open
    document.body.style.overflow = 'hidden';
});

document.getElementById('createPrincipalButton').addEventListener("click", function() {
    const name = document.getElementById('nprincipalName').value;
    const ocountry = document.getElementById('noriginCountry').value;
    const tier = document.getElementById('nprincipalTier').value;
    const agreement = document.getElementById('nagencyAgreement').value;
    const impfee = document.getElementById('importFee').value; 
    const impfeeCurrency = document.getElementById('nimportFeeCurrency').value;
    const expfeeTNL = document.getElementById('exportFeeTNL').value; 
    const expfeeTNLCurrency = document.getElementById('nexportFeeTNLCurrency').value;
    const expfeeAGT = document.getElementById('exportFeeAGT').value; 
    const expfeeAGTCurrency = document.getElementById('nexportFeeAGTCurrency').value;
    const mtRepoFee = document.getElementById('mtRepoFee').value; 
    const mtRepoFeeCurrency = document.getElementById('nmtRepoFeeCurrency').value;
    const demurrage = document.getElementById('ndemurrageCommission').value;
    const notes = document.getElementById('nprincipalNotes').value;
    const isHidden = document.getElementById('nprincipalHidden').checked; 
    const isArchived = document.getElementById('nprincipalArchived').checked; 

    fetch(`/add_principal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: name,
            ocountry: ocountry,
            tier: tier, 
            agreement: agreement, 
            impfee: impfee, 
            impfeeCurrency: impfeeCurrency, 
            expfeeTNL: expfeeTNL, 
            expfeeTNLCurrency: expfeeTNLCurrency, 
            expfeeAGT: expfeeAGT, 
            expfeeAGTCurrency: expfeeAGTCurrency, 
            mtRepoFee: mtRepoFee, 
            mtRepoFeeCurrency: mtRepoFeeCurrency, 
            demurrage: demurrage,  
            notes: notes,
            isHidden: isHidden,
            isArchived: isArchived
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert("Principal Created!")
        location.reload();
    })
    .catch(error => {
        alert('Failed to create principal. Please try again.');
    });
});