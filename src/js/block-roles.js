wp.domReady(function () {
    let settingsChanged = false;

    // Disable or enable import/export buttons based on settings changes
    function toggleImportExportButtons() {
        const exportButton = document.getElementById('export-block-roles');
        const importLabel = document.querySelector('label[for="import-block-roles-file"]');

        if (settingsChanged) {
          //  exportButton.disabled = true;
          //  importLabel.classList.add('disabled');
        } else {
         //   exportButton.disabled = false;
         //   importLabel.classList.remove('disabled');
        }
    }

    // Ensure buttons are enabled on page load
    toggleImportExportButtons();


// Update buttons state after save or import
function updateSettings(newSettings) {
    blockRolesSettings.block_roles_settings = newSettings;
    settingsChanged = false;
    toggleImportExportButtons();
    revertUnsavedChangesIndicator();
    indicateUnsavedSlider(); // Add this line
}


function indicateUnsavedSlider() {
    document.querySelectorAll('.slider.round').forEach(function (slider) {
        if (settingsChanged) {
            slider.parentElement.parentElement.classList.add('unsaved-changes');
        } else {
            slider.parentElement.parentElement.classList.remove('unsaved-changes');
        }
    });
}


function updateSettingsOnImport(response) {
    if (response.success) {
        const newSettings = response.data.updated_settings;


        // Update the checkboxes to reflect the new settings
        document.querySelectorAll('.individual-toggle').forEach(function (checkbox) {
            const blockNameElement = checkbox.closest('tr').querySelector('td[data-block-name]');

            if (blockNameElement) {
                const blockName = blockNameElement.getAttribute('data-block-name');
                const role = checkbox.getAttribute('data-role');

                // Check if the imported settings have a matching block and role
                if (newSettings.hasOwnProperty(blockName) && newSettings[blockName].hasOwnProperty(role)) {
                    const value = newSettings[blockName][role];
                    checkbox.checked = value === "1" || value === 1 || value === true || value === "true";

                    // Debugging: Log the checkbox state being set
                } else {
                    // Uncheck if not in the new settings
                    checkbox.checked = false;

                    // Debugging: Log the checkbox being unchecked
                }

                // Update the status text after setting the checkbox
                updateToggleStatus(checkbox);
            } else {
                // Debugging: Log if no block name element was found
                console.warn("No status span found for checkbox:", checkbox);
            }
        });

        // Reset settings state and indicate successful import
        settingsChanged = false;
        revertUnsavedChangesIndicator(); // Explicitly reset button state
        showMessage(response.data.message); // Show success message
    } else {
        showMessage('Failed to import settings. Please try again.');
    }
}



 // Call `updateToggleStatus` for each `.individual-toggle` on page load
 document.querySelectorAll('.individual-toggle').forEach(function (checkbox) {
    updateToggleStatus(checkbox);
});

// Function to update toggle status text and add corresponding class
function updateToggleStatus(checkbox) {
    // Attempt to find the closest status span based on the expected structure
    const statusSpan = checkbox.closest('td').querySelector('.toggle-status');

    if (statusSpan) {
        const isChecked = checkbox.checked;
        
        // Set the status text
        statusSpan.textContent = isChecked ? 'Available' : 'Hidden';

        // Add or remove classes based on the checkbox state
        statusSpan.classList.toggle('status-visible', isChecked);
        statusSpan.classList.toggle('status-hidden', !isChecked);

    } else {
        // Debugging: Warn if no status span was found
        console.warn("No status span found for checkbox:", checkbox);
    }
}


// Function to indicate unsaved changes on the submit button
function indicateUnsavedChanges() {
    const submitButton = document.getElementById('save-block-roles-settings');

    // Check if there's already an "Unsaved Changes!" message
    let unsavedMessage = document.getElementById('unsaved-changes-message');

    // If not, create and insert the message before the submit button
    if (!unsavedMessage) {
        unsavedMessage = document.createElement('p');
        unsavedMessage.id = 'unsaved-changes-message';
        unsavedMessage.style.color = 'red';
        unsavedMessage.style.fontWeight = 'bold';
        unsavedMessage.style.marginBottom = '10px';
        unsavedMessage.textContent = 'Unsaved Changes!';
        submitButton.parentElement.insertBefore(unsavedMessage, submitButton);
    }

    // Make the submit button red
    if (submitButton) {
        submitButton.style.backgroundColor = 'red';
        submitButton.style.borderColor = 'red';
    }
}

// Revert the 'unsaved-change' class on save
function revertUnsavedChangesIndicator() {
    const submitButton = document.getElementById('save-block-roles-settings');
    const unsavedMessage = document.getElementById('unsaved-changes-message');

    // Revert button color
    if (submitButton) {
        submitButton.style.backgroundColor = '';
        submitButton.style.borderColor = '';
    }

    // Remove the "Unsaved Changes!" message if it exists
    if (unsavedMessage) {
        unsavedMessage.remove();
    }

    // Remove the 'unsaved-change' class from all toggles
    document.querySelectorAll('.unsaved-change').forEach(function (checkbox) {
        checkbox.classList.remove('unsaved-change');
    });
}



    // Export button functionality
document.getElementById('export-block-roles').addEventListener('click', function () {
    const settingsData = blockRolesSettings.block_roles_settings;

    // Get the current date and time
    const now = new Date();
    const formattedDateTime = now.toISOString().split('T')[0]; // e.g., '2024-10-19'
    // Get the site URL (you can modify this if needed to get a more appropriate reference)
    const siteUrl = window.location.hostname;

    // Create a JSON file name with the site URL and current date-time
    const fileName = `${siteUrl}-block-roles-${formattedDateTime}.json`;

     // Create a JSON file and trigger download
     const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = fileName;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
});

    // Import functionality
    document.getElementById('import-block-roles-file').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedSettings = JSON.parse(e.target.result);

                // Confirm before applying the new settings
                if (confirm('Are you sure you want to overwrite the current settings with the imported file?')) {
                    jQuery.ajax({
                        url: ajaxurl,
                        method: 'POST',
                        data: {
                            action: 'acemedia_block_roles_import_settings',
                            security: blockRolesSettings.nonce,
                            block_roles_settings: importedSettings
                        },
                        success: function (response) {
                            if (response.success) {
                                updateSettingsOnImport(response);
                                showMessage(response.data.message);
                            } else {
                                showMessage('Failed to import settings. Please try again.');
                            }
                        },
                        error: function () {
                            showMessage('Failed to import settings. Please try again.');
                        }
                    });
                }
            } catch (error) {
                alert('Invalid JSON file. Please check the format and try again.');
            }
        };
        reader.readAsText(file);
    });

    // Capture form submission and update the internal state
    const form = document.querySelector('form[action="options.php"]');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            const settingsData = {};

            formData.forEach((value, key) => {
                if (key.startsWith('block_roles_settings')) {
                    const matches = key.match(/\[(.*?)\]\[(.*?)\]/);
                    if (matches) {
                        const blockName = matches[1];
                        const role = matches[2];
                        if (!settingsData[blockName]) {
                            settingsData[blockName] = {};
                        }
                        settingsData[blockName][role] = value === '1' ? 1 : 0;
                    }
                }
            });

            // Send AJAX request
            jQuery.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'acemedia_block_roles_save_settings',
                    security: blockRolesSettings.nonce,
                    block_roles_settings: settingsData
                },
                success: function (response) {
                    if (response.success) {
                        updateSettings(response.data.updated_settings);
                        showMessage(response.data.message);
                    } else {
                        showMessage('Failed to save settings. Please try again.');
                        form.submit();
                    }
                },
                error: function () {
                    showMessage('Failed to save settings. Please try again.');
                    form.submit();
                }
            });
        });
    }

    function showMessage(message) {
        const submitButton = document.querySelector('input[name="save-block-roles-settings"]');
        
        if (submitButton) {
            // Store the original button text
            const originalButtonText = 'Save Settings'
            const originalButtonBackground = submitButton.style.background;
        
            // Change the button text
            submitButton.value = 'Saving...';
    
            // Revert the button text back after 5 seconds
            setTimeout(() => {
                submitButton.value = message;
                submitButton.style.background = 'green';
            }, 1000);



    
            // Revert the button text back after a short period
            setTimeout(() => {
                submitButton.value = originalButtonText;
                submitButton.style.background = originalButtonBackground;
            }, 2500);
        }
    }
    

    // Toggle All Button functionality
    document.querySelectorAll('.toggle-all-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            const category = this.getAttribute('data-category');
            const checkboxes = document.querySelectorAll(`.individual-toggle[data-role="${role}"][data-category="${category}"]`);
    
            // Determine if we are turning everything on or off
            const shouldCheck = !Array.from(checkboxes).every(cb => cb.checked);
    
            // Set all checkboxes to match the determined state
            checkboxes.forEach(function (checkbox) {
                checkbox.checked = shouldCheck;
                updateToggleStatus(checkbox); // Update the status text
                settingsChanged = true;
                checkbox.parentElement.parentElement.classList.add('unsaved-change');
            });
    
            // Indicate there are unsaved changes
            indicateUnsavedChanges();
        });
    });

    document.querySelectorAll('.individual-toggle').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            updateToggleStatus(this);
            settingsChanged = true;
    
            // Add 'unsaved-change' class to the clicked toggle
            this.parentElement.parentElement.classList.add('unsaved-change');
    
            // Indicate there are unsaved changes
            indicateUnsavedChanges();
        });
    });
    
   
});



function updateFixedPosition() {
    const adminMenuWrap = document.querySelector('#adminmenuwrap');
    const fixedElement = document.querySelector('.block-roles-save-bar');

    if (adminMenuWrap && fixedElement) {
        // Measure the width of #adminmenuwrap
        const adminMenuWidth = adminMenuWrap.offsetWidth;

        // Set the left position of the fixed element
        fixedElement.style.left = `${adminMenuWidth}px`; // 1rem = 16px
    }
}

// Update position on load, resize, and scroll
window.addEventListener('resize', updateFixedPosition);
window.addEventListener('scroll', updateFixedPosition);
window.addEventListener('load', updateFixedPosition);


// Listen for #collapse-button clicks to adjust the position
const collapseButton = document.querySelector('#collapse-button');
if (collapseButton) {
    collapseButton.addEventListener('click', () => {
        // Use a slight delay to wait for the menu animation to complete
        setTimeout(updateFixedPosition, 3);
    });
}



document.getElementById('import-block-roles-button').addEventListener('click', function () {
    document.getElementById('import-block-roles-file').click();
});