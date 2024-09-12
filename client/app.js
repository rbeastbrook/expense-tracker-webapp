const form = document.getElementById('expense-form');
const expensesList = document.getElementById('expenses-list');
const summaryDiv = document.getElementById('summary');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const apiUrl = 'http://localhost:3000/api/expenses';

// Ensure elements exist
if (!form || !expensesList || !summaryDiv || !editForm || !editIdInput) {
    console.error('One or more required elements are missing from the DOM.');
    throw new Error('DOM elements missing');
}

// Event listener for adding new expenses
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    // Validate inputs
    if (!description || isNaN(amount) || !category) {
        console.error('Invalid input values:', { description, amount, category });
        return;
    }

    const newExpense = { description, amount, category };

   // console.log('Submitting new expense:', newExpense); // Debugging line

    try {
        // Make the POST request to add the expense
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense)
        });

        console.log('Add response status:', res.status);
        const responseText = await res.text();
        console.log('Add response text:', responseText);

        if (!res.ok) {
            throw new Error(`Network response was not ok: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        console.log('Expense added:', result);

        form.reset(); // Reset the form fields
        await loadExpenses(); // Refresh the expense list
    } catch (error) {
        console.error('Error adding expense:', error);
    }
});

// Function to load expenses
async function loadExpenses() {
    try {
        const res = await fetch(apiUrl);
        console.log('Load expenses response status:', res.status);
        const responseText = await res.text();
       // console.log('Load expenses response text:', responseText);
        if (!res.ok) throw new Error(`Network response was not ok: ${responseText}`);

        const expenses = JSON.parse(responseText);
        expensesList.innerHTML = '';
        let total = 0;

        expenses.forEach(expense => {
            total += expense.amount;
            expensesList.innerHTML += `
                <div>
                    <strong>${expense.description}</strong> - $${expense.amount} (${expense.category})
                    <button onclick="deleteExpense('${expense._id}')">Delete</button>
                    <button onclick="editExpense('${expense._id}', '${expense.description}', ${expense.amount}, '${expense.category}')">Edit</button>
                </div>
            `;
        });

        summaryDiv.innerHTML = `Total: $${total}`;
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

// Function to delete an expense
async function deleteExpense(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        console.log('Delete response status:', res.status);
        const responseText = await res.text();
        console.log('Delete response text:', responseText);

        if (!res.ok) throw new Error(`Network response was not ok: ${responseText}`);

        const result = JSON.parse(responseText);
        console.log('Expense deleted:', result);
        await loadExpenses(); // Refresh the expense list
    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}

// Function to edit an expense (populate the form)
function editExpense(id, description, amount, category) {
    editIdInput.value = id;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-amount').value = amount;
    document.getElementById('edit-category').value = category;
    editForm.style.display = 'block'; // Show the edit form
}

// Event listener for updating an existing expense
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const description = document.getElementById('edit-description').value;
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const category = document.getElementById('edit-category').value;

    // Validate inputs
    if (!id || !description || isNaN(amount) || !category) {
        console.error('Invalid input values:', { id, description, amount, category });
        return;
    }

    const updatedExpense = { description, amount, category };

   // console.log('Submitting updated expense:', updatedExpense);

    try {
        const res = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedExpense)
        });

        console.log('Update response status:', res.status);
        const responseText = await res.text();
        console.log('Update response text:', responseText);

        if (!res.ok) {
            throw new Error(`Network response was not ok: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        console.log('Expense updated:', result);

        editForm.reset();
        editForm.style.display = 'none'; // Hide the edit form
        await loadExpenses(); // Refresh the expense list
    } catch (error) {
        console.error('Error updating expense:', error);
    }
});

// Load expenses on page load
loadExpenses();
