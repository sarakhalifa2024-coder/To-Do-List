let tasks = [];

const taskContainer = document.getElementById('task-list');
const addBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task-input');
const searchInput = document.getElementById('search-input');
const totalSpan = document.getElementById('total-count');
const completedSpan = document.getElementById('completed-count');
const remainingSpan = document.getElementById('remaining-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

let currentFilter = 'all';   
let searchQuery = '';


function saveToLocalStorage() {
  localStorage.setItem('glass_tasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  const stored = localStorage.getItem('glass_tasks');

  if (stored) {
    tasks = JSON.parse(stored);
  } else {
   
    tasks = [];
  }

  tasks = tasks.map(task => ({
    ...task,
    important: task.important === undefined ? false : task.important,
    completed: task.completed === undefined ? false : task.completed
  }));

  render();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;

  totalSpan.innerText = total;
  completedSpan.innerText = completed;
  remainingSpan.innerText = remaining;
}

function showToast(message) {
  const msg = document.createElement('div');
  msg.className = 'toast-msg';
  msg.innerText = message;
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 1500);
}

function getFilteredTasks() {
  let filtered = [...tasks];

  if (searchQuery.trim() !== '') {
    const lowerQuery = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(task => task.text.toLowerCase().includes(lowerQuery));
  }

  switch (currentFilter) {
    case 'active':
      filtered = filtered.filter(task => !task.completed);
      break;
    case 'completed':
      filtered = filtered.filter(task => task.completed);
      break;
    case 'important':
      filtered = filtered.filter(task => task.important);
      break;
    case 'all':
    default:
      break;
  }

  return filtered;
}

function getSortedTasksForDisplay(filteredArr) {
  return filteredArr;
}
function render() {
  updateStats();

  const filteredBase = getFilteredTasks();
  const displayTasks = getSortedTasksForDisplay(filteredBase);

  if (displayTasks.length === 0) {
    taskContainer.innerHTML = `
      <div class="empty-msg">
        <i class="far fa-smile-wink"></i> ✨ No tasks here ✨
      </div>
    `;
    return;
  }

  taskContainer.innerHTML = '';

  displayTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed-task' : ''}`;
    card.dataset.id = task.id;

    const taskInfoDiv = document.createElement('div');
    taskInfoDiv.className = 'task-info';

    const starSpan = document.createElement('span');
    starSpan.className = `star-icon ${task.important ? 'important-active' : ''}`;
    starSpan.textContent = task.important ? '⭐' : '☆';
    starSpan.title = 'Mark as important';
    starSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleImportant(task.id);
    });

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.innerText = task.text;

    titleSpan.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      enableInlineEdit(titleSpan, task.id, task.text);
    });

    taskInfoDiv.appendChild(starSpan);
    taskInfoDiv.appendChild(titleSpan);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const statusIcon = document.createElement('span');
    statusIcon.className = 'status-icon';
    statusIcon.textContent = task.completed ? '❤️' : '😡';
    statusIcon.title = task.completed ? 'Mark as unfinished' : 'Mark as finished';

    statusIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    });

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash-alt delete-icon';
    deleteIcon.title = 'Delete task';
    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTaskById(task.id);
    });

    actionsDiv.appendChild(statusIcon);
    actionsDiv.appendChild(deleteIcon);

    card.appendChild(taskInfoDiv);
    card.appendChild(actionsDiv);

    taskContainer.appendChild(card);
  });
}

function enableInlineEdit(titleSpan, taskId, currentText) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'edit-input';

  titleSpan.style.display = 'none';

  const parent = titleSpan.parentNode;
  parent.insertBefore(input, titleSpan);

  input.focus();
  input.select();

  const finishEdit = () => {
    const newVal = input.value.trim();

    if (newVal !== '') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.text = newVal;
        saveToLocalStorage();
      }
    }

    render();
  };

  input.addEventListener('blur', finishEdit);

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      finishEdit();
    }
  });
}

function addNewTask() {
  const taskText = newTaskInput.value.trim();

  if (taskText === "") {
    showToast("⛔ Task cannot be empty!");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    important: false,
  };

  tasks.push(newTask);
  saveToLocalStorage();

  newTaskInput.value = '';
  render();
}

function deleteTaskById(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToLocalStorage();
  render();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);

  if (task) {
    task.completed = !task.completed;
    saveToLocalStorage();
    render();
  }
}

function toggleImportant(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  const task = tasks[index];

  tasks.splice(index, 1);

  if (!task.important) {
    task.important = true;
    tasks.unshift(task); 
  } else {
    task.important = false;
    tasks.push(task); 
  }

  saveToLocalStorage();
  render();
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveToLocalStorage();
  render();
}

function setActiveFilterButton(filterType) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === filterType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  setActiveFilterButton(filter);
  render();
}

function handleSearch() {
  searchQuery = searchInput.value;
  render();
}

addBtn.addEventListener('click', addNewTask);

newTaskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addNewTask();
  }
});

searchInput.addEventListener('input', handleSearch);

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filterVal = btn.dataset.filter;
    applyFilter(filterVal);
  });
});

loadTasksFromStorage();