import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTask, setEditingTask] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    project: 'Personal'
  })

  // Sample projects for demonstration
  const projects = [
    { id: 'personal', name: 'Personal', color: '#6366f1', count: 0 },
    { id: 'work', name: 'Work', color: '#f59e0b', count: 0 },
    { id: 'health', name: 'Health', color: '#10b981', count: 0 },
    { id: 'learning', name: 'Learning', color: '#8b5cf6', count: 0 }
  ]

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      // Add some sample tasks for demonstration
      const sampleTasks = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Finish the quarterly project proposal for the marketing team',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date().toISOString().split('T')[0],
          project: 'Work',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Weekly grocery shopping',
          description: 'Buy groceries for the week including vegetables and fruits',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          project: 'Personal',
          createdAt: new Date().toISOString()
        }
      ]
      setTasks(sampleTasks)
      localStorage.setItem('taskflow-tasks', JSON.stringify(sampleTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const newTask = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: 'pending',
      dueDate: formData.dueDate,
      project: formData.project,
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, newTask])
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', project: 'Personal' })
    setShowAddForm(false)
    toast.success('Task created successfully!')
  }

  const handleUpdateTask = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...formData, title: formData.title.trim(), description: formData.description.trim() }
        : task
    ))
    setEditingTask(null)
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', project: 'Personal' })
    toast.success('Task updated successfully!')
  }

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const handleToggleStatus = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === 'completed' ? 'pending' : 'completed' 
          }
        : task
    ))
    toast.success('Task status updated!')
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      project: task.project
    })
    setShowAddForm(true)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', project: 'Personal' })
    setShowAddForm(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-red-500 bg-red-50 border-red-200'
      case 'medium': return 'text-secondary bg-secondary/10 border-secondary/20'
      case 'low': return 'text-accent bg-accent/10 border-accent/20'
      default: return 'text-surface-600 bg-surface-100 border-surface-200'
    }
  }

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return { text: 'No due date', className: 'text-surface-500' }
    
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) {
      return { text: 'Overdue', className: 'text-red-600' }
    }
    if (isToday(date)) {
      return { text: 'Due today', className: 'text-secondary' }
    }
    if (isTomorrow(date)) {
      return { text: 'Due tomorrow', className: 'text-blue-600' }
    }
    return { text: `Due ${format(date, 'MMM d')}`, className: 'text-surface-600' }
  }

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'completed') return task.status === 'completed'
      if (filter === 'pending') return task.status !== 'completed'
      return true
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== 'completed').length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Tasks', value: stats.total, icon: 'List', color: 'primary' },
          { label: 'Completed', value: stats.completed, icon: 'CheckCircle', color: 'accent' },
          { label: 'Pending', value: stats.pending, icon: 'Clock', color: 'secondary' },
          { label: 'Overdue', value: stats.overdue, icon: 'AlertTriangle', color: 'red-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-4 sm:p-6 shadow-card border border-surface-200 dark:border-surface-700 hover:shadow-soft transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                <ApperIcon name={stat.icon} className={`w-6 h-6 text-${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card border border-surface-200 dark:border-surface-700"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'pending', 'completed'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                    filter === filterOption
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>

          {/* Add Task Button */}
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 py-3 rounded-xl font-medium shadow-soft hover:shadow-card transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            Add Task
          </motion.button>
        </div>
      </motion.div>

      {/* Add/Edit Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card border border-surface-200 dark:border-surface-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={3}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Project
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.name}>{project.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-soft"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700"
            >
              <ApperIcon name="ClipboardList" className="w-16 h-16 text-surface-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
                {searchTerm ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first task to get started!'}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => {
              const dueDateStatus = getDueDateStatus(task.dueDate)
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`task-card ${task.status === 'completed' ? 'completed' : ''} priority-${task.priority}`}
                >
                  <div className="flex items-start gap-4">
                    <motion.button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        task.status === 'completed'
                          ? 'bg-accent border-accent text-white'
                          : 'border-surface-300 dark:border-surface-600 hover:border-accent'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {task.status === 'completed' && (
                        <ApperIcon name="Check" className="w-4 h-4" />
                      )}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-semibold mb-1 ${
                            task.status === 'completed' 
                              ? 'line-through text-surface-500 dark:text-surface-400' 
                              : 'text-surface-900 dark:text-surface-100'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-surface-600 dark:text-surface-400 text-sm line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="project-chip">
                            {task.project}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4 text-sm">
                          <span className={dueDateStatus.className}>
                            <ApperIcon name="Calendar" className="w-4 h-4 inline mr-1" />
                            {dueDateStatus.text}
                          </span>
                          <span className={`status-badge status-${task.status}`}>
                            {task.status === 'in-progress' ? 'In Progress' : task.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleEditTask(task)}
                            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ApperIcon name="Edit" className="w-4 h-4 text-surface-500" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default MainFeature