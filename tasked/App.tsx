// App.tsx
import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ListRenderItem,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, Todo, SubTask } from "./constants";
import { loadTodos, saveTodos } from "./services/storage";
import TodoItem from "./components/TodoItem";
import * as Font from 'expo-font';

interface FABProps {
  onPress: () => void;
}
const FloatingActionButton: FC<FABProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
  </TouchableOpacity>
);

interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (title: string, parentId?: string) => void;
  isSubTask?: boolean;
  parentTodo?: Todo | null;
}

const AddTaskModal: FC<AddTaskModalProps> = ({
  isVisible,
  onClose,
  onAdd,
  isSubTask = false,
  parentTodo,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const handleAdd = (): void => {
    if (newTaskTitle.trim()) {
      onAdd(newTaskTitle.trim());
      setNewTaskTitle("");
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isSubTask
              ? `Add Sub-task to "${parentTodo?.title}"`
              : "Add New Task"}
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder={
              isSubTask ? "What needs to be done?" : "What needs to be done?"
            }
            placeholderTextColor={COLORS.lightText}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAdd}
            autoFocus
            returnKeyType="done"
          />
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setNewTaskTitle("");
                onClose();
              }}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalAddButton,
                !newTaskTitle.trim() && { backgroundColor: COLORS.lightText },
              ]}
              onPress={handleAdd}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.modalAddButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const App: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSubTaskModalVisible, setIsSubTaskModalVisible] =
    useState<boolean>(false);
  const [selectedParentTodo, setSelectedParentTodo] = useState<Todo | null>(
    null
  );
 
  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'TTFirsNeue-Regular': require('./assets/fonts/tt-firs-neue-trial.regular.ttf'),
        'TTFirsNeue-Bold': require('./assets/fonts/tt-firs-neue-trial.bold.ttf'),
        'DM-Sans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
      });
    };

    loadFonts();
  }, []);

  // Load data from storage on component mount
  useEffect(() => {
    const init = async () => {
      const storedTodos: Todo[] = await loadTodos();
      setTodos(storedTodos);
      setIsLoading(false);
    };
    init();
  }, []);

  // Save data to storage whenever the todo state changes
  useEffect(() => {
    if (!isLoading) {
      saveTodos(todos);
    }
  }, [todos, isLoading]);

  // Handlers
  const handleAddTask = (title: string, parentId?: string): void => {
    if (parentId) {
      // Add subtask
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: title,
        isCompleted: false,
        parentId: parentId,
      };

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === parentId
            ? { ...todo, subTasks: [...todo.subTasks, newSubTask] }
            : todo
        )
      );
    } else {
      // Add main task
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: title,
        isCompleted: false,
        subTasks: [],
        isExpanded: false,
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    }
  };

  const handleToggleTodo = (id: string): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleToggleSubTask = (parentId: string, subTaskId: string): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === parentId
          ? {
              ...todo,
              subTasks: todo.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? { ...subTask, isCompleted: !subTask.isCompleted }
                  : subTask
              ),
            }
          : todo
      )
    );
  };

  const handleDeleteTodo = (id: string): void => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const handleDeleteSubTask = (parentId: string, subTaskId: string): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === parentId
          ? {
              ...todo,
              subTasks: todo.subTasks.filter(
                (subTask) => subTask.id !== subTaskId
              ),
            }
          : todo
      )
    );
  };

  const handleEditTodo = (id: string, newTitle: string): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      )
    );
  };

  const handleEditSubTask = (
    parentId: string,
    subTaskId: string,
    newTitle: string
  ): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === parentId
          ? {
              ...todo,
              subTasks: todo.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? { ...subTask, title: newTitle }
                  : subTask
              ),
            }
          : todo
      )
    );
  };

  const handleToggleExpand = (id: string): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isExpanded: !todo.isExpanded } : todo
      )
    );
  };

  const handleAddSubTask = (todo: Todo): void => {
    setSelectedParentTodo(todo);
    setIsSubTaskModalVisible(true);
  };

  const renderItem: ListRenderItem<Todo> = ({ item }) => (
    <TodoItem
      todo={item}
      onToggle={handleToggleTodo}
      onToggleSubTask={handleToggleSubTask}
      onDelete={handleDeleteTodo}
      onDeleteSubTask={handleDeleteSubTask}
      onEdit={handleEditTodo}
      onEditSubTask={handleEditSubTask}
      onToggleExpand={handleToggleExpand}
      onAddSubTask={handleAddSubTask}
    />
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>tasked</Text>
      </View>

      <View style={styles.contentContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading tasks...</Text>
        ) : (
          <FlatList
            data={todos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            extraData={todos}
          />
        )}
      </View>

      <FloatingActionButton onPress={() => setIsModalVisible(true)} />

      <AddTaskModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddTask}
      />

      <AddTaskModal
        isVisible={isSubTaskModalVisible}
        onClose={() => {
          setIsSubTaskModalVisible(false);
          setSelectedParentTodo(null);
        }}
        onAdd={(title) => handleAddTask(title, selectedParentTodo?.id)}
        isSubTask={true}
        parentTodo={selectedParentTodo}
      />
    </SafeAreaView>
  );
};

export default App;

// Styles
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 10,
    backgroundColor: COLORS.white,
  },
  headerTime: {
    position: "absolute",
    top: 10,
    left: 25,
    fontWeight: "600",
    fontSize: 15,
    zIndex: 20,
  },
  headerIcons: {
    position: "absolute",
    top: 10,
    right: 25,
    zIndex: 20,
  },
  headerIconText: {
    fontSize: 15,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: 'TTFirsNeue-Bold',
    marginBottom: 15,
    marginTop: 35,
    color: COLORS.darkText,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 25,
  },
  listContent: {
    paddingBottom: 80,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.lightText,
  },

  fab: {
    position: "absolute",
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 12,
    width: "85%",
    maxWidth: 400,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    color: COLORS.darkText,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
  },
  modalCancelButtonText: {
    color: COLORS.lightText,
    fontSize: 16,
    fontWeight: "500",
  },
  modalAddButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalAddButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
