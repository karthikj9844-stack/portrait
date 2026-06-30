/**
 * Local storage utilities for todo management
 */

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  dueDate?: number
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

export interface TodoFilters {
  searchTerm: string
  priority?: 'low' | 'medium' | 'high' | 'all'
  category?: string
  status?: 'all' | 'active' | 'completed'
}

const STORAGE_KEY = 'todos_app_data'

export function getTodos(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get todos:', error)
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('Failed to save todos:', error)
  }
}

export function addTodo(text: string, options?: {
  priority?: 'low' | 'medium' | 'high'
  dueDate?: number
  category?: string
}): Todo {
  const todos = getTodos()
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now(),
    priority: options?.priority,
    dueDate: options?.dueDate,
    category: options?.category,
  }
  todos.push(newTodo)
  saveTodos(todos)
  return newTodo
}

export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const todos = getTodos()
  const index = todos.findIndex(t => t.id === id)
  if (index === -1) return null

  todos[index] = { ...todos[index], ...updates }
  saveTodos(todos)
  return todos[index]
}

export function deleteTodo(id: string): boolean {
  const todos = getTodos()
  const filtered = todos.filter(t => t.id !== id)
  if (filtered.length === todos.length) return false
  saveTodos(filtered)
  return true
}

export function toggleTodo(id: string): Todo | null {
  const todo = getTodos().find(t => t.id === id)
  if (!todo) return null
  return updateTodo(id, { completed: !todo.completed })
}

export function clearCompleted(): number {
  const todos = getTodos()
  const filtered = todos.filter(t => !t.completed)
  const removed = todos.length - filtered.length
  saveTodos(filtered)
  return removed
}

export function filterTodos(filters: TodoFilters): Todo[] {
  let todos = getTodos()

  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    todos = todos.filter(t => t.text.toLowerCase().includes(term))
  }

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    todos = todos.filter(t =>
      filters.status === 'completed' ? t.completed : !t.completed
    )
  }

  // Filter by priority
  if (filters.priority && filters.priority !== 'all') {
    todos = todos.filter(t => t.priority === filters.priority)
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    todos = todos.filter(t => t.category === filters.category)
  }

  return todos
}

export function getStats() {
  const todos = getTodos()
  return {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    highPriority: todos.filter(t => t.priority === 'high' && !t.completed).length,
  }
}

export function exportTodos(): string {
  const todos = getTodos()
  return JSON.stringify(todos, null, 2)
}

export function importTodos(data: string): { success: boolean; message: string } {
  try {
    const todos = JSON.parse(data)
    if (!Array.isArray(todos)) {
      return { success: false, message: 'Invalid format: expected an array' }
    }
    saveTodos(todos)
    return { success: true, message: `Imported ${todos.length} todos` }
  } catch (error) {
    return { success: false, message: 'Failed to parse JSON' }
  }
}
