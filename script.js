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
