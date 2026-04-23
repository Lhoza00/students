document.addEventListener('DOMContentLoaded', () => {

    const toDoForm = document.getElementById('toDoForm');
    const titleInput = document.getElementById('todoTitle');
    const dateInput = document.getElementById('todoDate');
    const taskInput = document.getElementById('todoInput');
    const toDoListUL = document.querySelector('.toDoList');

    const API_URL = "http://localhost:3000/todos";

    let allTodos = [];

    // Load from API on start
    fetchTodos();

    // =====================
    // CREATE TODO
    // =====================
    toDoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo();
    });

    function addTodo() {
        const todoObject = {
            title: titleInput.value.trim(),
            date: dateInput.value,
            task: taskInput.innerText.trim(),
            completed: false
        };

        if (!todoObject.title || !todoObject.task || !todoObject.date) return;

        createTodoAPI(todoObject);

        titleInput.value = '';
        dateInput.value = '';
        taskInput.innerText = '';
    }

    // =====================
    // RENDER LIST
    // =====================
    function updateTodoList() {
        toDoListUL.innerHTML = '';

        allTodos.forEach(todo => {
            const li = createTodoItem(todo);
            toDoListUL.appendChild(li);
        });

        observeItems();
    }

    function createTodoItem(todo) {
        const li = document.createElement('li');
        li.className = 'todo-card';
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-grid">
                <h3>${todo.id}</h3>

                <input class="todo-title" value="${todo.title}" readonly />

                <input class="todo-date" type="date" value="${todo.date}" readonly />

                <div class="todo-task" contenteditable="false">${todo.task}</div>

                <div class="todo-actions">
                    <button class="toggle">${todo.completed ? 'Undo' : 'Complete'}</button>
                    <button class="delete">Delete</button>
                </div>
            </div>
        `;

        const titleEl = li.querySelector('.todo-title');
        const taskEl = li.querySelector('.todo-task');
        const deleteBtn = li.querySelector('.delete');
        const toggleBtn = li.querySelector('.toggle');

        // =====================
        // EDIT TITLE
        // =====================
        titleEl.addEventListener('click', () => {
            titleEl.readOnly = false;
        });

        titleEl.addEventListener('blur', () => {
            titleEl.readOnly = true;

            updateTodoAPI(todo.id, {
                title: titleEl.value,
                task: todo.task,
                completed: todo.completed
            });
        });

        // =====================
        // EDIT TASK
        // =====================
        taskEl.addEventListener('click', () => {
            taskEl.contentEditable = true;
        });

        taskEl.addEventListener('blur', () => {
            taskEl.contentEditable = false;

            updateTodoAPI(todo.id, {
                title: todo.title,
                task: taskEl.innerText,
                completed: todo.completed
            });
        });

        // =====================
        // DELETE
        // =====================
        deleteBtn.addEventListener('click', () => {
            deleteTodoAPI(todo.id);
        });

        // =====================
        // COMPLETE TOGGLE
        // =====================
        toggleBtn.addEventListener('click', () => {
            updateTodoAPI(todo.id, {
                title: todo.title,
                task: todo.task,
                completed: !todo.completed
            });
        });

        return li;
    }

    // =====================
    // FADE IN EFFECT
    // =====================
    function observeItems() {
        const items = document.querySelectorAll('.todo-card');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });

        items.forEach(item => observer.observe(item));
    }

    // =====================
    // API CONNECTION
    // =====================

    async function fetchTodos() {
        try {
            const res = await fetch(API_URL);
            allTodos = await res.json();
            updateTodoList();
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }

    async function createTodoAPI(todo) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todo)
            });

            fetchTodos();
        } catch (err) {
            console.error("Create error:", err);
        }
    }

    async function updateTodoAPI(id, updatedFields) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFields)
            });

            fetchTodos();
        } catch (err) {
            console.error("Update error:", err);
        }
    }

    async function deleteTodoAPI(id) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            fetchTodos();
        } catch (err) {
            console.error("Delete error:", err);
        }
    }

});
