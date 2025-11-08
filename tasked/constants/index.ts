export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  parentId: string;
}

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  subTasks: SubTask[];
  isExpanded?: boolean;
}

// Unique key for AsyncStorage
export const STORAGE_KEY = "@Tasked_Todos";

// Colors
export const COLORS = {
  background: "#EEEEEE",
  darkText: "#111111",
  lightText: "#555555",
  primary: "#51ACB4",
  white: "#FFFFFF",
  danger: "#FF6347",
  lightGray: "#f8fafc",
  border: "#e2e8f0",
};

// Initial placeholder data
export const INITIAL_TODOS: Todo[] = [
  {
    id: "1",
    title: "typography",
    isCompleted: false,
    subTasks: [],
    isExpanded: false,
  },
  {
    id: "2",
    title: "layout",
    isCompleted: false,
    subTasks: [],
    isExpanded: false,
  },
  {
    id: "3",
    title: "color",
    isCompleted: false,
    subTasks: [],
    isExpanded: false,
  },
  {
    id: "4",
    title: "style",
    isCompleted: false,
    subTasks: [],
    isExpanded: false,
  },
  {
    id: "5",
    title: "get started",
    isCompleted: true,
    subTasks: [],
    isExpanded: false,
  },
  {
    id: "6",
    title: "meditate",
    isCompleted: true,
    subTasks: [],
    isExpanded: false,
  },
];

export interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: (parentId: string, subTaskId: string) => void;
  onDelete: (parentId: string, subTaskId: string) => void;
  onEdit: (parentId: string, subTaskId: string, newTitle: string) => void;
  parentId: string;
}

export interface RoundCheckboxProps {
  isCompleted: boolean;
  onPress: () => void;
}

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onToggleSubTask: (parentId: string, subTaskId: string) => void;
  onDelete: (id: string) => void;
  onDeleteSubTask: (parentId: string, subTaskId: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onEditSubTask: (
    parentId: string,
    subTaskId: string,
    newTitle: string
  ) => void;
  onToggleExpand: (id: string) => void;
  onAddSubTask: (todo: Todo) => void;
}
