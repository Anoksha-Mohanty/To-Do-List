document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const dueDateInput = document.getElementById('dueDate');
  const addTaskButton = document.getElementById('addTaskButton');
  const taskList = document.getElementById('taskList');

  // Load tasks from localStorage and render them
  renderTasks();

  // Event listener for adding tasks
  addTaskButton.addEventListener('click', addTask);

  function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === '') return;

    const tasks = getTasksFromLocalStorage();
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      dueDate: dueDate,
    };

    tasks.push(newTask);
    saveTasksToLocalStorage(tasks);
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = '';
  }

  function renderTasks() {
    taskList.innerHTML = '';
    const tasks = getTasksFromLocalStorage();

    tasks.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)); 

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.id = task.id;
      li.draggable = true;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

      const span = document.createElement('span');
      span.textContent = task.text;
      if (task.completed) {
        span.style.textDecoration = 'line-through';
        span.style.color = 'grey';
      }

      const taskDate = document.createElement('span');
      taskDate.className = 'task-date';
      taskDate.textContent = task.dueDate;

      const editButton = document.createElement('button');
      editButton.className = 'icon edit';
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.addEventListener('click', () => enableEditing(task.id, span, taskDate));

      const deleteButton = document.createElement('button');
      deleteButton.className = 'icon delete';
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(taskDate);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
      taskList.appendChild(li);

      li.classList.add('fade-in');
    });

    addDragAndDropListeners();
  }

  function addDragAndDropListeners() {
    const items = document.querySelectorAll('#taskList li');
    items.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);
    });
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);
    e.target.classList.remove('dragging');
    if (e.target.tagName === 'LI') {
      e.target.parentNode.insertBefore(draggedElement, e.target.nextSibling);
      updateTaskOrder();
    }
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }

  function toggleTaskCompletion(taskId) {
    const tasks = getTasksFromLocalStorage();
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasksToLocalStorage(tasks);
      renderTasks();
    }
  }

  function enableEditing(taskId, span, taskDate) {
    const tasks = getTasksFromLocalStorage();
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      span.style.display = 'none';
      taskDate.style.display = 'none';

      const editContainer = document.createElement('div');
      editContainer.className = 'inline-edit';

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;

      const editDateInput = document.createElement('input');
      editDateInput.type = 'date';
      editDateInput.value = task.dueDate;

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.className = 'save';
      saveButton.addEventListener('click', () => saveTask(taskId, editInput.value, editDateInput.value, editContainer, span, taskDate));

      editContainer.appendChild(editInput);
      editContainer.appendChild(editDateInput);
      editContainer.appendChild(saveButton);

      const li = document.getElementById(taskId);
      li.appendChild(editContainer);
    }
  }

  function saveTask(taskId, newText, newDate, editContainer, span, taskDate) {
    const tasks = getTasksFromLocalStorage();
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      task.text = newText.trim();
      task.dueDate = newDate;
      saveTasksToLocalStorage(tasks);
      renderTasks();
    }
  }

  function deleteTask(taskId) {
    const tasks = getTasksFromLocalStorage();
    const filteredTasks = tasks.filter(t => t.id != taskId);
    saveTasksToLocalStorage(filteredTasks);
    renderTasks();
  }

  function updateTaskOrder() {
    const tasks = Array.from(taskList.children).map(li => ({
      id: parseInt(li.id),
      text: li.querySelector('span').textContent,
      completed: li.querySelector('input[type="checkbox"]').checked,
      dueDate: li.querySelector('.task-date').textContent,
    }));
    saveTasksToLocalStorage(tasks);
  }

  function getTasksFromLocalStorage() {
    const tasksJson = localStorage.getItem('tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
  }

  function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
});
