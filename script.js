document.addEventListener('DOMContentLoaded', () => {
    const settingsIcon = document.querySelector('.settings-icon');
    const settingsPopup = document.querySelector('.settings-popup');
    const mainContent = document.querySelector('body > *:not(.settings-icon):not(.settings-popup)');

    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPopup.classList.toggle('active');
        
        // Toggle blur effect on main content
        Array.from(document.body.children).forEach(element => {
            if (element !== settingsIcon && element !== settingsPopup) {
                element.classList.toggle('blur-background');
            }
        });
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPopup.contains(e.target) && !settingsIcon.contains(e.target)) {
            settingsPopup.classList.remove('active');
            Array.from(document.body.children).forEach(element => {
                if (element !== settingsIcon && element !== settingsPopup) {
                    element.classList.remove('blur-background');
                }
            });
        }
    });

    // Prevent popup from closing when clicking inside it
    settingsPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    initializeSettings();
});

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let editedTaskId = null;
let showCompleted = false;  // Track whether we're showing completed tasks

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const notification = document.getElementById('notification');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const completedBtn = document.getElementById('completed-btn');
const importModal = document.getElementById('import-modal');
const importTextarea = document.getElementById('import-textarea');
const importSaveBtn = document.getElementById('import-save-btn');
const importCancelBtn = document.getElementById('import-cancel-btn');

const editModal = document.getElementById('edit-modal');
const editTaskInput = document.getElementById('edit-task-input');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

const modalOverlay = document.getElementById('modal-overlay');

// Display tasks from the local storage
function renderTasks() {
  todoList.innerHTML = ''; // Clear the list before re-rendering

  // Filter tasks if necessary
  let filteredTodos = todos;
  if (showCompleted !== null) {
    filteredTodos = todos.filter(task => task.completed === showCompleted);
  }

  // If no tasks are present for the filtered category, show a message
  if (filteredTodos.length === 0) {
    const noTasksMessage = document.createElement('div');
    noTasksMessage.classList.add('no-tasks-message');
    const icon = document.createElement('i');
    icon.classList.add('fas', showCompleted ? 'fa-sad-tear' : 'fa-list-ul');
    const text = document.createElement('span');
    text.innerText = showCompleted ? "You didn't complete any tasks yet." : "Make a todo to get started!";

    noTasksMessage.appendChild(icon);
    noTasksMessage.appendChild(text);
    todoList.appendChild(noTasksMessage);
  } else {
    filteredTodos.forEach((task) => {
      const li = document.createElement('li');
      li.classList.toggle('completed', task.completed); // Update the list item's class based on completion

      // Add background color for completed tasks
      if (task.completed) {
        li.classList.add('completed-task'); // Light green background for completed tasks
      }

      const checkboxContainer = document.createElement('div');
      checkboxContainer.classList.add('checkbox-container');
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `checkbox-${task.id}`;
      checkbox.checked = task.completed; // Sync the checkbox with task completion status
      checkbox.classList.add('checkbox-input'); // Add a class for styling purposes
      
      const customCheckbox = document.createElement('div');
      customCheckbox.classList.add('custom-checkbox');
      if (task.completed) customCheckbox.classList.add('checked'); // Add checked class if completed

      // Label to make checkbox clickable
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id); // Link label to checkbox
      label.appendChild(checkbox);
      label.appendChild(customCheckbox);

      checkboxContainer.appendChild(label);

      const taskContent = document.createElement('div');
      taskContent.classList.add('task-content');
      const taskText = document.createElement('span');
      taskText.innerText = task.text || 'Untitled'; // Fallback for text if missing
      taskContent.appendChild(taskText);

      const actionButtons = document.createElement('div');
      actionButtons.classList.add('action-buttons');
      const editBtn = document.createElement('button');
      editBtn.innerText = 'Edit';
      editBtn.classList.add('edit-btn');
      const deleteBtn = document.createElement('button');
      deleteBtn.innerText = 'Delete';
      deleteBtn.classList.add('delete-btn');
      actionButtons.appendChild(editBtn);
      actionButtons.appendChild(deleteBtn);

      li.appendChild(checkboxContainer);
      li.appendChild(taskContent);
      li.appendChild(actionButtons);
      todoList.appendChild(li);

      // Edit task functionality
      editBtn.addEventListener('click', () => {
        editedTaskId = task.id;
        editTaskInput.value = task.text;
        editModal.style.display = 'block';
        modalOverlay.style.display = 'block';
      });

      // Delete task functionality
      deleteBtn.addEventListener('click', () => {
        editedTaskId = task.id;
        confirmDeleteModal.style.display = 'block';
        modalOverlay.style.display = 'block';
      });

      // Toggle task completion on checkbox change
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked; // Update task's completed state

        // Update the visual state of the custom checkbox
        customCheckbox.classList.toggle('checked', checkbox.checked);

        // Update the todos array and save to localStorage
        todos = todos.map(t => t.id === task.id ? { ...t, completed: task.completed } : t);
        localStorage.setItem('todos', JSON.stringify(todos));

        renderTasks(); // Re-render tasks to update the task lists
      });
    });
  }
}

// Show only completed tasks or only todo tasks
completedBtn.addEventListener('click', function () {
  showCompleted = !showCompleted; // Toggle the state

  if (showCompleted) {
    this.innerText = 'Show Todo'; // Change button text when showing completed tasks
  } else {
    this.innerText = 'Show Completed'; // Reset button text when showing todo tasks
  }

  renderTasks(); // Re-render tasks based on the filter
});

// Add new task
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (todoInput.value.trim()) {
    const newTask = {
      id: Date.now(),
      text: todoInput.value.trim(),
      completed: false,
    };
    todos.push(newTask);
    localStorage.setItem('todos', JSON.stringify(todos));
    todoInput.value = '';
    renderTasks(); // Re-render tasks after adding new task
  }
});

// Save edited task
saveEditBtn.addEventListener('click', () => {
  const updatedTask = todos.find((task) => task.id === editedTaskId);
  if (updatedTask) {
    updatedTask.text = editTaskInput.value.trim();
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTasks();
    editModal.style.display = 'none';
    modalOverlay.style.display = 'none';
  }
});

// Cancel edit task
cancelEditBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  modalOverlay.style.display = 'none';
});

// Confirm delete task
confirmDeleteBtn.addEventListener('click', () => {
  todos = todos.filter((task) => task.id !== editedTaskId); // Remove task by ID
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTasks();
  confirmDeleteModal.style.display = 'none';
  modalOverlay.style.display = 'none';
});

// Cancel delete task
cancelDeleteBtn.addEventListener('click', () => {
  confirmDeleteModal.style.display = 'none';
  modalOverlay.style.display = 'none';
});

// Export tasks
exportBtn.addEventListener('click', () => {
  const jsonTasks = JSON.stringify(todos);
  navigator.clipboard.writeText(jsonTasks).then(() => {
    notification.innerText = 'Tasks Exported Successfully!';
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
  });
});

// Import tasks
importBtn.addEventListener('click', () => {
  importModal.style.display = 'block';
  modalOverlay.style.display = 'block';
});

// Save imported tasks
importSaveBtn.addEventListener('click', () => {
  const errorMessage = document.getElementById('error-message');
  try {
    const importedTasks = JSON.parse(importTextarea.value);
    if (Array.isArray(importedTasks)) {
      todos = importedTasks;
      localStorage.setItem('todos', JSON.stringify(todos));
      renderTasks();
      importModal.style.display = 'none';
      modalOverlay.style.display = 'none';
      errorMessage.classList.remove('show');  // Hide error message if input is valid
    } else {
      throw new Error('Invalid format');
    }
  } catch (e) {
    errorMessage.classList.add('show');  // Show error message if JSON is invalid

    // Automatically hide the error message after 5 seconds
    setTimeout(() => {
      errorMessage.classList.remove('show');  // Hide error message
    }, 1500);  // 1.5 seconds delay
  }
});

// Cancel import task
importCancelBtn.addEventListener('click', () => {
  importModal.style.display = 'none';
  modalOverlay.style.display = 'none';
});

// Initial render
renderTasks();

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.backgroundColor = type === 'error' ? '#ff3b30' : '#34c759';
    notification.style.display = 'block';
    notification.style.zIndex = '3000'; // Ensure it's above everything
    setTimeout(() => notification.style.display = 'none', 3000);
}

// Add event listeners for online/offline status
window.addEventListener('online', () => showNotification('You are online'));
window.addEventListener('offline', () => showNotification('You are offline'));

// Add translations
const translations = {
    en: {
        addTask: "Add a new task",
        addButton: "Add",
        editButton: "Edit",
        deleteButton: "Delete",
        showCompleted: "Show Completed",
        showTodo: "Show Todo",
        confirmDelete: "Are you sure you want to delete this task?",
        yes: "Yes",
        no: "No",
        clearStorage: "Clear Storage & Cache",
        confirmClear: "Are you sure? This will delete all your tasks and settings.",
        taskExported: "Tasks Exported Successfully!",
        invalidJson: "Invalid JSON format! Please try again.",
        noTasks: "Make a todo to get started!",
        noCompletedTasks: "You didn't complete any tasks yet."
    },
    bn: {
        addTask: "নতুন টাস্ক যোগ করুন",
        addButton: "যোগ করুন",
        editButton: "সম্পাদনা",
        deleteButton: "মুছুন",
        showCompleted: "সম্পন্ন কাজগুলি দেখুন",
        showTodo: "বাকি কাজগুলি দেখুন",
        confirmDelete: "আপনি কি এই টাস্কটি মুছে ফেলতে চান?",
        yes: "হ্যাঁ",
        no: "না",
        clearStorage: "স্টোরেজ এবং ক্যাশে পরিষ্কার করুন",
        confirmClear: "আপনি কি নিশ্চিত? এটি আপনার সমস্ত টাস্ক এবং সেটিংস মুছে ফেলবে।",
        taskExported: "টাস্কগুলি সফলভাবে এক্সপোর্ট করা হয়েছে!",
        invalidJson: "অবৈধ JSON ফরম্যাট! অনুগ্রহ করে আবার চেষ্টা করুন।",
        noTasks: "শুরু করতে একটি টাস্ক তৈরি করুন!",
        noCompletedTasks: "আপনি এখনও কোন টাস্ক সম্পন্ন করেননি।"
    }
};

function updateLanguage(lang) {
    const currentLang = translations[lang] || translations.en;
    
    // Update all text elements
    document.getElementById('todo-input').placeholder = currentLang.addTask;
    document.querySelector('#todo-form button').textContent = currentLang.addButton;
    document.querySelectorAll('.edit-btn').forEach(btn => btn.textContent = currentLang.editButton);
    document.querySelectorAll('.delete-btn').forEach(btn => btn.textContent = currentLang.deleteButton);
    document.getElementById('completed-btn').textContent = showCompleted ? currentLang.showTodo : currentLang.showCompleted;
    
    // Update modal texts
    document.querySelector('#confirm-delete-modal p').textContent = currentLang.confirmDelete;
    document.getElementById('confirm-delete-btn').textContent = currentLang.yes;
    document.getElementById('cancel-delete-btn').textContent = currentLang.no;
    
    // Re-render tasks to update any task-related text
    renderTasks();
}

function clearStorageAndCache() {
    return new Promise(async (resolve, reject) => {
        try {
            // Clear localStorage
            localStorage.clear();
            
            // Clear all caches
            if ('caches' in window) {
                const cacheKeys = await caches.keys();
                await Promise.all(cacheKeys.map(key => caches.delete(key)));
            }
            
            // Unregister service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.getServiceWorkerRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function downloadBackup(data, filename) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function initializeSettings() {
    const settingsIcon = document.querySelector('.settings-icon');
    const settingsPopup = document.querySelector('.settings-popup');
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Get all modal elements
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutBtn = document.getElementById('close-about-btn');
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    const clearStorageConfirmation = document.getElementById('clear-storage-confirmation');
    const clearStorageYes = document.getElementById('clear-storage-yes');
    const clearStorageNo = document.getElementById('clear-storage-no');
    const backupModal = document.getElementById('backup-modal');
    const closeBackupBtn = document.getElementById('close-backup-btn');

    function showModal(modal) {
        settingsPopup.classList.remove('active');
        modalOverlay.style.display = 'block';
        modal.style.display = 'block';
        document.body.classList.add('blur-background');
    }

    function hideModal(modal) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        document.body.classList.remove('blur-background');
    }

    // Modified export/backup handler
    exportBtn.addEventListener('click', () => {
        const jsonTasks = JSON.stringify(todos);
        navigator.clipboard.writeText(jsonTasks).then(() => {
            showModal(backupModal);
        });
    });

    closeBackupBtn.addEventListener('click', () => {
        hideModal(backupModal);
    });

    // About button handler
    aboutBtn.addEventListener('click', () => {
        showModal(aboutModal);
    });

    closeAboutBtn.addEventListener('click', () => {
        hideModal(aboutModal);
    });

    // Clear storage handler
    clearStorageBtn.addEventListener('click', () => {
        showModal(clearStorageConfirmation);
    });

    clearStorageYes.addEventListener('click', () => {
        try {
            // Clear data immediately
            localStorage.clear();
            todos = [];
            
            // Clear caches if available
            if ('caches' in window) {
                caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                });
            }

            // Hide modal immediately
            hideModal(clearStorageConfirmation);
            
            // Show notification and reload
            showNotification('Storage cleared! Reloading...');
            
            // Force reload after a short delay
            setTimeout(() => {
                window.location.href = window.location.href;
            }, 1000);

        } catch (error) {
            showNotification('Failed to clear storage', 'error');
        }
    });

    clearStorageNo.addEventListener('click', () => {
        hideModal(clearStorageConfirmation);
    });

    // Close all modals when clicking overlay
    modalOverlay.addEventListener('click', () => {
        [aboutModal, clearStorageConfirmation, backupModal].forEach(modal => {
            hideModal(modal);
        });
    });

    // Theme toggle handler
    const themeToggle = document.getElementById('theme-mode-toggle');
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme', !themeToggle.checked);
        localStorage.setItem('darkMode', themeToggle.checked);
    });

    // Language handler
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', () => {
        const selectedLang = languageSelect.value;
        localStorage.setItem('language', selectedLang);
        updateLanguage(selectedLang);
    });

    // Initialize language
    updateLanguage(localStorage.getItem('language') || 'en');

    // Backup modal handlers
    const copyKeyBtn = document.getElementById('copy-key-btn');
    const downloadBackupBtn = document.getElementById('download-backup-btn');

    copyKeyBtn.addEventListener('click', () => {
        const jsonTasks = JSON.stringify(todos);
        navigator.clipboard.writeText(jsonTasks)
            .then(() => {
                hideModal(backupModal); // First hide the modal
                showNotification('Secret key copied to clipboard!'); // Then show notification
            })
            .catch(() => {
                showNotification('Failed to copy key', 'error');
            });
    });

    downloadBackupBtn.addEventListener('click', () => {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadBackup(todos, `todo-backup-${timestamp}.json`);
        showNotification('Backup file downloaded!');
    });

    // Import modal handlers
    const importFile = document.getElementById('import-file');
    
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                importTextarea.value = event.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Modified import button handler
    importBtn.addEventListener('click', () => {
        showModal(importModal);
        settingsPopup.classList.remove('active');
    });

    // Close modals when clicking outside
    modalOverlay.addEventListener('click', () => {
        const modals = [aboutModal, clearStorageConfirmation, backupModal, importModal];
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                hideModal(modal);
            }
        });
    });

    // Export handler
    exportBtn.addEventListener('click', () => {
        const jsonTasks = JSON.stringify(todos);
        navigator.clipboard.writeText(jsonTasks);
        showModal(backupModal);
        settingsPopup.classList.remove('active');
    });

    // PWA installation handler
    let deferredPrompt;
    const installApp = document.getElementById('install-app');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installApp.style.display = 'flex'; // Show install button
    });

    installApp.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('App installed successfully!');
        }
        
        deferredPrompt = null;
        installApp.style.display = 'none';
    });

    // Hide install button if app is already installed
    window.addEventListener('appinstalled', () => {
        installApp.style.display = 'none';
        showNotification('App installed successfully!');
    });
}

// Apply theme on load
document.body.classList.toggle('light-theme', localStorage.getItem('darkMode') === 'false');

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
document.body.classList.toggle('light-theme', localStorage.getItem('darkMode') === 'false');
            });
    });
}


// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}
