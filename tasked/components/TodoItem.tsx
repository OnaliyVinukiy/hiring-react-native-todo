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
import { COLORS, Todo } from "../constants";

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

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

const TodoItem: FC<TodoItemProps> = React.memo(
  ({ todo, onToggle, onDelete, onEdit }) => {
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
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    backgroundColor: COLORS.white,
    zIndex: 10,
    paddingVertical: 10,
    borderRadius: 8,
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
});
