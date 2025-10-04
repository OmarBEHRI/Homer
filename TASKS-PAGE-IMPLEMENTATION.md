# Tasks Page Implementation Plan

## 🎯 Overview
Implementation of a comprehensive task management system with a hierarchical structure: Tables → Lists → Tasks, similar to Trello's interface.

## 📋 Implementation Phases

### Phase 1: Database Schema & Backend (Convex)
- [ ] **1.1 Schema Design**
  - Define `tables` collection with fields: id, name, userId, createdAt, updatedAt
  - Define `lists` collection with fields: id, tableId, name, order, createdAt, updatedAt
  - Define `tasks` collection with fields: id, listId, title, description, deadline, priority, color, isCompleted, order, createdAt, updatedAt
  - Add proper indexes for efficient queries

- [ ] **1.2 Convex Functions**
  - **Queries:**
    - `getUserTables` - Get all tables for a user
    - `getTableWithLists` - Get table with its lists
    - `getListWithTasks` - Get list with its tasks
    - `getTableData` - Get complete table data (table + lists + tasks)
  
  - **Mutations:**
    - `createTable` - Create new table with default lists
    - `updateTable` - Rename/update table
    - `deleteTable` - Delete table and all its data
    - `createList` - Add new list to table
    - `updateList` - Rename/update list
    - `deleteList` - Delete list and its tasks
    - `createTask` - Add new task to list
    - `updateTask` - Update task details
    - `deleteTask` - Delete task
    - `moveTask` - Move task between lists
    - `toggleTaskCompletion` - Mark task as done/undone

### Phase 2: Core UI Components
- [ ] **2.1 Layout Components**
  - `TasksPage` - Main page container
  - `TasksLayout` - Layout with sidebar and main area
  - `TableSidebar` - Left sidebar with table list and search
  - `MainWorkspace` - Main area showing selected table

- [ ] **2.2 Table Management**
  - `TableList` - List of tables in sidebar
  - `TableItem` - Individual table button
  - `CreateTableModal` - Modal for creating new tables
  - `EditTableModal` - Modal for editing table name

- [ ] **2.3 List Management**
  - `ListColumn` - Vertical column for lists
  - `ListHeader` - Header with list name and add task button
  - `CreateListModal` - Modal for creating new lists
  - `EditListModal` - Modal for editing list name

- [ ] **2.4 Task Management**
  - `TaskCard` - Individual task card
  - `TaskModal` - Modal for editing task details
  - `TaskForm` - Form for creating/editing tasks
  - `PrioritySelector` - Component for selecting task priority
  - `ColorSelector` - Component for selecting task color
  - `DeadlinePicker` - Date/time picker for deadlines

### Phase 3: Interactive Features
- [ ] **3.1 Inline Editing**
  - Inline editing for table names
  - Inline editing for list names
  - Inline editing for task titles

- [ ] **3.2 Drag & Drop**
  - Drag tasks between lists
  - Reorder tasks within lists
  - Reorder lists within tables

- [ ] **3.3 Task Interactions**
  - Checkbox for task completion
  - Hover tooltips showing deadline info
  - Click to open task details modal

### Phase 4: Advanced Features
- [ ] **4.1 Search & Filter**
  - Search tables by name
  - Filter tasks by priority, deadline, completion status

- [ ] **4.2 Visual Enhancements**
  - Color-coded task cards
  - Priority indicators
  - Deadline warnings (overdue tasks)
  - Progress indicators

- [ ] **4.3 Responsive Design**
  - Mobile-friendly layout
  - Touch-friendly interactions
  - Responsive sidebar

### Phase 5: Integration & Polish
- [ ] **5.1 State Management**
  - React state for UI interactions
  - Convex real-time subscriptions
  - Optimistic updates

- [ ] **5.2 Error Handling**
  - Loading states
  - Error boundaries
  - User feedback for actions

- [ ] **5.3 Performance**
  - Lazy loading of components
  - Efficient re-renders
  - Debounced search

## 🗂️ File Structure
```
components/
  tasks/
    ├── TasksPage.tsx              # Main page component
    ├── TasksLayout.tsx            # Layout wrapper
    ├── TableSidebar.tsx           # Left sidebar
    ├── MainWorkspace.tsx          # Main content area
    ├── TableList.tsx              # Table list component
    ├── TableItem.tsx              # Individual table
    ├── ListColumn.tsx             # List column
    ├── TaskCard.tsx               # Task card
    ├── modals/
    │   ├── CreateTableModal.tsx
    │   ├── EditTableModal.tsx
    │   ├── CreateListModal.tsx
    │   ├── EditListModal.tsx
    │   └── TaskModal.tsx
    └── forms/
        ├── TaskForm.tsx
        ├── PrioritySelector.tsx
        ├── ColorSelector.tsx
        └── DeadlinePicker.tsx

convex/
  ├── tasks.ts                     # Task-related functions
  └── schema.ts                    # Updated schema
```

## 🎨 Design Considerations
- **Color Scheme**: Use predefined colors for task tags
- **Typography**: Consistent with existing app design
- **Spacing**: Proper spacing between elements
- **Icons**: Use consistent icon set
- **Animations**: Smooth transitions for interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔧 Technical Requirements
- **Framework**: Next.js 14 with App Router
- **Database**: Convex for real-time data
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit/core (if needed)
- **Date Handling**: date-fns
- **State Management**: React hooks + Convex subscriptions

## 📱 Responsive Breakpoints
- **Desktop**: Full sidebar + main workspace
- **Tablet**: Collapsible sidebar
- **Mobile**: Stack layout with bottom navigation

## 🚀 Success Criteria
- [ ] Users can create, edit, and delete tables
- [ ] Users can create, edit, and delete lists within tables
- [ ] Users can create, edit, and delete tasks within lists
- [ ] Tasks can be moved between lists
- [ ] Real-time updates across all users
- [ ] Responsive design works on all devices
- [ ] Smooth animations and interactions
- [ ] Proper error handling and loading states
