import { Toaster } from 'sonner'
import TodoApp from './pages/TodoApp'

export default function App() {
  return (
    <>
      <TodoApp />
      <Toaster position="bottom-center" />
    </>
  )
}
