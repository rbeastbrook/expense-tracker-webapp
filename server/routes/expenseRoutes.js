const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await req.app.locals.db.collection('expenses').find().toArray();
    res.json(expenses);
  } catch (err) {
    console.error('Error retrieving expenses:', err);
    res.status(500).json({ message: 'Failed to retrieve expenses' });
  }
});

// Add new expense
router.post('/', async (req, res) => {
  const { description, amount, category } = req.body;
  
  // Validate inputs
  if (!description || !amount || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const expense = { description, amount, category };

  try {
    const result = await req.app.locals.db.collection('expenses').insertOne(expense);
    if (result.insertedId) {
      const insertedExpense = await req.app.locals.db.collection('expenses').findOne({ _id: result.insertedId });
      res.status(201).json(insertedExpense);
    } else {
      res.status(500).json({ message: 'Failed to insert expense' });
    }
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
});

// Update an expense
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { description, amount, category } = req.body;

  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
      console.log(`Invalid ObjectId: ${id}`);
      return res.status(400).json({ message: 'Invalid ID format' });
  }

  console.log('Updating expense with ID:', id);
  console.log('Update data:', { description, amount, category });

  try {
      // Convert ID to ObjectId explicitly
      const objectId = new ObjectId(id);

      // Perform the update
      const updateResult = await req.app.locals.db.collection('expenses').updateOne(
          { _id: objectId },
          { $set: { description, amount, category } }
      );

      if (updateResult.matchedCount === 0) {
          console.log(`Expense not found for ID: ${id}`);
          return res.status(404).json({ message: 'Expense not found' });
      }

      // Fetch the updated document
      const updatedExpense = await req.app.locals.db.collection('expenses').findOne({ _id: objectId });

      if (!updatedExpense) {
          console.log(`Expense not found after update for ID: ${id}`);
          return res.status(404).json({ message: 'Expense not found' });
      }

      console.log('Updated expense:', updatedExpense);
      res.json(updatedExpense);
  } catch (err) {
      console.error('Error updating expense:', err);
      res.status(500).json({ message: 'Failed to update expense' });
  }
});


// Delete an expense
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Attempt to delete the expense
    const result = await req.app.locals.db.collection('expenses').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

module.exports = router;
