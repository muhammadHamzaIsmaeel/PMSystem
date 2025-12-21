/**
 * DashboardLayout component
 * This component will wrap the dashboard pages
 */
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
