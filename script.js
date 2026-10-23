

const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const submitBtn = document.getElementById("submitBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelector(".filters");

// Read previously saved tasks
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
} catch {
    tasks = [];
}

let currentFilter = "all";
let editingId = null;

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Display tasks on the page
function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        if (task.completed) li.classList.add("completed");
        li.dataset.id = task.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.className = "task-checkbox";
        checkbox.setAttribute("aria-label", "Mark task completed");

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "edit-btn";
        editBtn.dataset.action = "edit";
        editBtn.textContent = "Edit";
        editBtn.setAttribute("aria-label", "Edit " + task.text);

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.action = "delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", "Delete " + task.text);

        li.append(checkbox, span, editBtn, deleteBtn);
        taskList.appendChild(li);
    });

    const remaining = tasks.filter(task => !task.completed).length;
    taskCount.textContent =
        `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;

    emptyMessage.hidden = filteredTasks.length !== 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (filteredTasks.length === 0) {
        emptyMessage.textContent = "No tasks in this filter.";
    }
}

// CREATE: Add a new task or UPDATE an existing task
todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (text === "") return;

    if (editingId !== null) {
        tasks = tasks.map(task =>
            task.id === editingId ? { ...task, text } : task
        );
        editingId = null;
        submitBtn.textContent = "Add Task";
    } else {
        tasks.push({
            id: crypto.randomUUID(),
            text: text,
            completed: false
        });
    }

    saveTasks();
    renderTasks();
    todoForm.reset();
    taskInput.focus();
});

// UPDATE completion status using event delegation
taskList.addEventListener("change", function (event) {
    if (!event.target.matches(".task-checkbox")) return;

    const li = event.target.closest(".task-item");
    const id = li.dataset.id;

    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: event.target.checked }
            : task
    );

    saveTasks();
    renderTasks();
});

// UPDATE and DELETE using one delegated click listener
taskList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const li = button.closest(".task-item");
    const id = li.dataset.id;

    if (button.dataset.action === "delete") {
        tasks = tasks.filter(task => task.id !== id);

        if (editingId === id) {
            editingId = null;
            submitBtn.textContent = "Add Task";
            todoForm.reset();
        }
    }

    if (button.dataset.action === "edit") {
        const task = tasks.find(task => task.id === id);
        if (!task) return;

        taskInput.value = task.text;
        editingId = id;
        submitBtn.textContent = "Save Changes";
        taskInput.focus();
    }

    saveTasks();
    renderTasks();
});

// FILTER: All, Active, Completed
filterButtons.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;

    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filterButton => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
});

// Show saved tasks when the page opens
renderTasks();
