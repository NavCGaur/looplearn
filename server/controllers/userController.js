import { getAllUsers, getUserById, assignWordToUser, removeWordFromUser } from '../services/user/index.js';

export const getUsers = async (req, res) => {
  console.log('Fetching all users in controller...');

  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  console.log('Fetching user by ID in controller...', req.params.userId);
  try {
    const user = await getUserById(req.params.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const assignWord = async (req, res) => {
  try {
    const { word } = req.body;
    const result = await assignWordToUser(req.params.userId, { word });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeWord = async (req, res) => {
  try {
    await removeWordFromUser(req.params.userId, req.params.wordId);
    res.status(200).json({ message: 'Word removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};