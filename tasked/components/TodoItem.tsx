import React, { useState, useRef, FC } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  SubTaskItemProps,
  RoundCheckboxProps,
  TodoItemProps,
} from "../constants";

interface TodoCheckboxProps {
  isCompleted: boolean;
  onPress: () => void;
}

const TodoCheckbox: FC<TodoCheckboxProps> = ({ isCompleted, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
        {isCompleted && (
          <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const RoundCheckbox: FC<RoundCheckboxProps> = ({ isCompleted, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.roundCheckboxContainer}>
      <View
        style={[
          styles.roundCheckbox,
          isCompleted && styles.roundCheckboxCompleted,
        ]}
      >
        {isCompleted && (
          <MaterialCommunityIcons name="check" size={12} color={COLORS.white} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SubTaskItem: FC<SubTaskItemProps> = React.memo(
  ({ subTask, onToggle, onDelete, onEdit, parentId }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>(subTask.title);

    const handleEditSubmit = (): void => {
      if (editText.trim() && editText !== subTask.title) {
        onEdit(parentId, subTask.id, editText.trim());
      }
      setIsEditing(false);
      Keyboard.dismiss();
    };

    const startEdit = (): void => {
      setIsEditing(true);
    };

    return (
      <View style={styles.subTaskItem}>
        <RoundCheckbox
          isCompleted={subTask.isCompleted}
          onPress={() => onToggle(parentId, subTask.id)}
        />
        {isEditing ? (
          <TextInput
            style={[styles.subTaskText, styles.editInput]}
            value={editText}
            onChangeText={setEditText}
            onBlur={handleEditSubmit}
            onSubmitEditing={handleEditSubmit}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity
            onPress={startEdit}
            style={styles.subTaskTextWrapper}
          >
            <Text
              style={[
                styles.subTaskText,
                subTask.isCompleted && styles.subTaskTextCompleted,
              ]}
              numberOfLines={2}
            >
              {subTask.title}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteSubTaskButton}
          onPress={() => onDelete(parentId, subTask.id)}
        >
          <MaterialCommunityIcons
            name="close"
            size={16}
            color={COLORS.lightText}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

const TodoItem: FC<TodoItemProps> = React.memo(
  ({
    todo,
    onToggle,
    onToggleSubTask,
    onDelete,
    onDeleteSubTask,
    onEdit,
    onEditSubTask,
    onToggleExpand,
    onAddSubTask,
  }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>(todo.title);

    const translateX = useRef(new Animated.Value(0)).current;

    // Constants for swiping
    const DELETE_THRESHOLD: number = -100;
    const SWIPE_LIMIT: number = -100;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return (
            !isEditing &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2 &&
            Math.abs(gestureState.dx) > 10
          );
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, SWIPE_LIMIT));
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx < DELETE_THRESHOLD / 2) {
            // Snap to the open delete position
            Animated.spring(translateX, {
              toValue: SWIPE_LIMIT,
              useNativeDriver: true,
            }).start();
          } else {
            // Snap back to original position
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    // Function to finalize editing
    const handleEditSubmit = (): void => {
      if (editText.trim() && editText !== todo.title) {
        onEdit(todo.id, editText.trim());
      }
      setIsEditing(false);
      Keyboard.dismiss();
      // Snap back in case the user was editing while swiped
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const startEdit = (): void => {
      setIsEditing(true);
    };

    const handleDeleteAnimation = (): void => {
      // Swipe off the screen, then delete
      Animated.timing(translateX, {
        toValue: -500,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDelete(todo.id));
    };

    const completedSubTasks = todo.subTasks.filter(
      (st) => st.isCompleted
    ).length;
    const totalSubTasks = todo.subTasks.length;
    const progress =
      totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

    return (
      <View style={styles.itemWrapper}>
        <View style={styles.deleteBackground}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAnimation}
          >
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.todoItem, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.todoContent}>
            <View style={styles.mainTaskRow}>
              <TodoCheckbox
                isCompleted={todo.isCompleted}
                onPress={() => onToggle(todo.id)}
              />
              {isEditing ? (
                <TextInput
                  style={[styles.taskText, styles.editInput]}
                  value={editText}
                  onChangeText={setEditText}
                  onBlur={handleEditSubmit}
                  onSubmitEditing={handleEditSubmit}
                  autoFocus
                  returnKeyType="done"
                />
              ) : (
                <TouchableOpacity
                  onPress={startEdit}
                  style={styles.taskTextWrapper}
                >
                  <Text
                    style={[
                      styles.taskText,
                      todo.isCompleted && styles.taskTextCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {todo.title}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.todoActions}>
                {todo.subTasks.length > 0 && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => onToggleExpand(todo.id)}
                  >
                    <MaterialCommunityIcons
                      name={todo.isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.lightText}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.addSubTaskButton}
                  onPress={() => onAddSubTask(todo)}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {todo.subTasks.length > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedSubTasks}/{totalSubTasks}
                </Text>
              </View>
            )}

            {todo.isExpanded && todo.subTasks.length > 0 && (
              <View style={styles.subTasksContainer}>
                {todo.subTasks.map((subTask) => (
                  <SubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    onToggle={onToggleSubTask}
                    onDelete={onDeleteSubTask}
                    onEdit={onEditSubTask}
                    parentId={todo.id}
                  />
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }
);

export default TodoItem;

// Styles
const styles = StyleSheet.create({
  itemWrapper: {
    marginVertical: 10,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    overflow: "hidden",
  },
  deleteButton: {
    height: "100%",
    justifyContent: "center",
  },
  todoItem: {
    backgroundColor: COLORS.white,
    zIndex: 10,
    borderRadius: 8,
    paddingVertical: 10,
  },
  todoContent: {
    paddingRight: 20,
  },
  mainTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
    color: COLORS.darkText,
    fontWeight: 400,
    lineHeight: 24,
  },
  taskTextCompleted: {
    color: COLORS.lightText,
    textDecorationLine: "line-through",
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 0,
    paddingBottom: 2,
  },

  checkboxContainer: {
    paddingRight: 15,
    paddingVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.darkText,
    backgroundColor: COLORS.darkText,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roundCheckboxContainer: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  roundCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightText,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  roundCheckboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expandButton: {
    padding: 4,
  },
  addSubTaskButton: {
    padding: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 39,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.lightText,
    minWidth: 30,
  },
  subTasksContainer: {
    marginTop: 8,
    marginLeft: 39,
    gap: 6,
  },
  subTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  subTaskTextWrapper: {
    flex: 1,
  },
  subTaskText: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: "400",
    lineHeight: 18,
  },
  subTaskTextCompleted: {
    color: COLORS.lightText,
    textDecorationLine: "line-through",
  },
  deleteSubTaskButton: {
    padding: 2,
  },
});
