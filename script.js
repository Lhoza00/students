const API_URL = "http://localhost:3000/students";

document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
});

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const S_NAME = document.getElementById("S_NAME").value.trim();
    const S_SURNAME = document.getElementById("S_SURNAME").value.trim();
    const S_MAIL = document.getElementById("S_MAIL").value.trim();

    if (!S_NAME || !S_SURNAME || !S_MAIL) {
        alert("Please fill in all student details.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ S_NAME, S_SURNAME, S_MAIL })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || result.error || 'Unknown error');
            return;
        }

        alert(result.message);
        e.target.reset();
        loadStudents();
    } catch {
        alert("A network error occurred.");
    }
});

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || errorData.error || 'Unknown error');
            return;
        }

        const students = await response.json();

        const tbody = document.getElementById("student-table-body");
        tbody.innerHTML = "";

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No students found.</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.ID}</td>
                <td><input type="text" value="${student.S_NAME}" data-original="${student.S_NAME}"/></td>
                <td><input type="text" value="${student.S_SURNAME}" data-original="${student.S_SURNAME}"/></td>
                <td><input type="email" value="${student.S_MAIL}" data-original="${student.S_MAIL}"/></td>
                <td>
                    <button class="update" onclick="updateStudent(${student.ID}, this)">Update</button>
                    <button class="delete" onclick="deleteStudent(${student.ID})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch {
        alert("Error loading students.");
    }
}

async function updateStudent(id, btn) {
    const row = btn.closest("tr");

    const S_NAME_input = row.children[1].children[0];
    const S_SURNAME_input = row.children[2].children[0];
    const S_MAIL_input = row.children[3].children[0];

    const S_NAME = S_NAME_input.value.trim();
    const S_SURNAME = S_SURNAME_input.value.trim();
    const S_MAIL = S_MAIL_input.value.trim();

    if (S_NAME === S_NAME_input.dataset.original &&
        S_SURNAME === S_SURNAME_input.dataset.original &&
        S_MAIL === S_MAIL_input.dataset.original) {
        alert("No changes detected.");
        return;
    }

    //if (!S_NAME || !S_SURNAME || !S_EMAIL) {
    //    alert("All fields (Name, Surname, Email) are required for update.");
    //    return;
    //}

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ S_NAME, S_SURNAME, S_MAIL })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || result.error);
            return;
        }

        alert(result.message);
        loadStudents();
    } catch {
        alert("Update error.");
    }
}

async function deleteStudent(id) {
    if (!confirm(`Delete student ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || result.error);
            return;
        }

        alert(result.message);
        loadStudents();
    } catch {
        alert("Delete error.");
    }
}