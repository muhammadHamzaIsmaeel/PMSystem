/**
 * Sidebar component for the dashboard layout
 */
import Link from 'next/link'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8">ProjectFlow</div>
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/dashboard" className="block hover:text-primary-400">
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/projects" className="block hover:text-primary-400">
              Projects
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/tasks" className="block hover:text-primary-400">
              Tasks
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/expenses" className="block hover:text-primary-400">
              Expenses
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/income" className="block hover:text-primary-400">
              Income
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/users" className="block hover:text-primary-400">
              Users
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
