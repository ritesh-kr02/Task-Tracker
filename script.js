const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const desc = document.getElementById('taskInput').value.trim();
  const deadline = document.getElementById('deadlineInput').value;
  const status = document.getElementById('statusInput').value;

  const id = Date.now();
  const task = { id, desc, deadline, status, created: new Date().toISOString() };
  tasks.push(task);
  save();
  render();
  scheduleReminder(task);
  taskForm.reset();
});

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
  taskList.innerHTML = '';
  tasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  tasks.forEach(task => {
    const li = document.createElement('li');
    const due = new Date(task.deadline);
    const daysLeft = Math.ceil((due - new Date()) / (1000*60*60*24));

    li.innerHTML = `
      <div>
        <span class="desc ${task.status === 'Completed' ? 'completed' : ''}">${task.desc}</span>
        <small>(Due ${task.deadline} — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</small>
      </div>
      <div>
        <span class="status-label status-${task.status.replace(' ', '\\ ')}">${task.status}</span>
        <select data-id="${task.id}" class="status-select">
          <option${task.status === 'Pending'? ' selected': ''}>Pending</option>
          <option${task.status === 'In Progress'? ' selected': ''}>In Progress</option>
          <option${task.status === 'Completed'? ' selected': ''}>Completed</option>
        </select>
        <button data-id="${task.id}" class="delete-btn">🗑</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

taskList.addEventListener('change', e => {
  if (e.target.matches('.status-select')) {
    const id = +e.target.dataset.id;
    const t = tasks.find(x => x.id === id);
    t.status = e.target.value;
    save();
    render();
  }
});

taskList.addEventListener('click', e => {
  if (e.target.matches('.delete-btn')) {
    const id = +e.target.dataset.id;
    tasks = tasks.filter(x => x.id !== id);
    save();
    render();
  }
});

function scheduleReminder(task) {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') return;

    const when = new Date(task.deadline).getTime() - 5 * 60 * 1000; // 5 min before
    const now = Date.now();
    const delay = when - now;
    if (delay > 0) {
      setTimeout(() => {
        new Notification('Task Reminder', {
          body: `5 minutes to "${task.desc}" due at ${task.deadline}`,
          badge: '',
        });
      }, delay);
    }
  });
}

tasks.forEach(scheduleReminder);

render();
