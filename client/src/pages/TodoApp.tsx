import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Check,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Zap,
  Calendar,
  Tag,
  Flag,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Todo,
  TodoFilters,
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  clearCompleted,
  filterTodos,
  getStats,
  exportTodos,
  importTodos,
} from '@/lib/storage'

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
}

const PRIORITY_BADGES = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState(getStats())

  // Load todos on mount
  useEffect(() => {
    const loadedTodos = getTodos()
    setTodos(loadedTodos)
    setStats(getStats())
  }, [])

  // Update stats when todos change
  useEffect(() => {
    setStats(getStats())
  }, [todos])

  const filters: TodoFilters = {
    searchTerm,
    status: statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  }

  const filteredTodos = filterTodos(filters)
  const categories = Array.from(new Set(todos.map(t => t.category).filter(Boolean)))

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      toast.error('Please enter a todo')
      return
    }

    const newTodo = addTodo(inputValue, { priority, category: category || undefined })
    setTodos([...todos, newTodo])
    setInputValue('')
    setCategory('')
    setPriority('medium')
    toast.success('Todo added!')
  }

  const handleToggleTodo = (id: string) => {
    const updated = toggleTodo(id)
    if (updated) {
      setTodos(getTodos())
      toast.success('Todo updated!')
    }
  }

  const handleDeleteTodo = (id: string) => {
    if (deleteTodo(id)) {
      setTodos(getTodos())
      toast.success('Todo deleted!')
    }
  }

  const handleClearCompleted = () => {
    const removed = clearCompleted()
    if (removed > 0) {
      setTodos(getTodos())
      toast.success(`Cleared ${removed} completed todos`)
    }
  }

  const handleExport = () => {
    const data = exportTodos()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Todos exported!')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = importTodos(content)
      if (result.success) {
        setTodos(getTodos())
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    }
    reader.readAsText(file)
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
              <Zap size={40} className="text-yellow-400" />
              Todo App
            </h1>
            <p className="text-lg text-slate-300">
              Organize your tasks with priority, categories, and local storage. Never lose your todos.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">High Priority</p>
            <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
          </div>
        </motion.div>

        {/* Add Todo Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleAddTodo}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                What needs to be done?
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new todo..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Flag size={16} /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Tag size={16} /> Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Work, Personal, etc."
                  list="categories"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Add Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Todo
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200"
        >
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Search size={16} /> Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search todos..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Filter size={16} /> Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Flag size={16} /> Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Tag size={16} /> Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="all">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Todos List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
        >
          {filteredTodos.length === 0 ? (
            <div className="p-12 text-center">
              <Zap size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 text-lg">
                {todos.length === 0 ? 'No todos yet. Create one to get started!' : 'No todos match your filters.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              <AnimatePresence>
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <Check size={16} className="text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg transition-all ${
                          todo.completed
                            ? 'line-through text-gray-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {todo.text}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {todo.priority && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded border ${
                              PRIORITY_COLORS[todo.priority]
                            }`}
                          >
                            {PRIORITY_BADGES[todo.priority]}
                          </span>
                        )}
                        {todo.category && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            📁 {todo.category}
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Footer Actions */}
        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3 justify-center"
          >
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all border border-red-200"
              >
                Clear Completed ({stats.completed})
              </button>
            )}

            <button
              onClick={handleExport}
              className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-all border border-blue-200 flex items-center gap-2"
            >
              <Download size={18} /> Export
            </button>

            <label className="px-6 py-2 bg-green-50 text-green-600 rounded-lg font-semibold hover:bg-green-100 transition-all border border-green-200 flex items-center gap-2 cursor-pointer">
              <Upload size={18} /> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all border border-slate-300 flex items-center gap-2"
            >
              <Settings size={18} /> Settings
            </button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-6 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>
            Built with React, Vite & Tailwind CSS. Todos saved in local storage. Never lose your tasks.
          </p>
        </div>
      </footer>
    </div>
  )
}
