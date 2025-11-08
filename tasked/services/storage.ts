import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY, INITIAL_TODOS, Todo } from "../constants";

/**
 * Loads the array of Todo items from AsyncStorage.
 * @returns {Promise<Todo[]>}
 */
export const loadTodos = async (): Promise<Todo[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    // If no data exists, return the initial data.
    return jsonValue != null ? JSON.parse(jsonValue) : INITIAL_TODOS;
  } catch (e) {
    console.error("Failed to load todos from storage", e);
    return INITIAL_TODOS;
  }
};


/**
 * Saves the entire array of Todo items to AsyncStorage.
 * @param {Todo[]} todos - The array of todos to save.
 * @returns {Promise<void>}
 */
export const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(todos);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save todos to storage", e);
  }
};
