// import '@scss/style.scss';
import { Modal } from 'bootstrap';

import type {User} from '../models/User.js';

async function fetchUsers(): Promise<User[]> {
    try {
        const response = await fetch('https://localhost:3000/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch users:", error);
        return [];
    }
}

function renderUsers(users: User[]): void {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt!).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${user.id}">Редактировать</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Удалить</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadUsers(): Promise<void> {
    const users = await fetchUsers();
    renderUsers(users);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();

    const addUserForm = document.getElementById('addUserForm');
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModalElement = document.getElementById('addUserModal');

    if (addUserModalElement) {
        const addUserModal = new Modal(addUserModalElement);

        addUserBtn?.addEventListener('click', async (event) => {
            event.preventDefault();

            const form = addUserForm as HTMLFormElement;
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const newUser = {
                avatarPath: (document.getElementById('addAvatar') as HTMLInputElement).value,
                surname: (document.getElementById('addSurname') as HTMLInputElement).value,
                name: (document.getElementById('addName') as HTMLInputElement).value,
                patronymic: (document.getElementById('addPatronymic') as HTMLInputElement).value,
                email: (document.getElementById('addEmail') as HTMLInputElement).value,
                username: (document.getElementById('addUsername') as HTMLInputElement).value,
                passwordHash: (document.getElementById('addPassword') as HTMLInputElement).value, // In a real app, you'd hash this
                birthday: new Date((document.getElementById('addBirthDate') as HTMLInputElement).value),
                role: (document.getElementById('addRole') as HTMLSelectElement).value,
            };

            try {
                const response = await fetch('https://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                form.reset();
                addUserModal.hide();
                await loadUsers(); // Refresh the user list

            } catch (error) {
                console.error('Failed to add user:', error);
                // Here you could show an error message to the user
            }
        });
    }
});
