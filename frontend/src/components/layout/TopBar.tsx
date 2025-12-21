/**
 * TopBar component for the dashboard layout
 */
const TopBar = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-700 text-white rounded-lg px-4 py-2"
        />
      </div>
      <div>User Profile</div>
    </header>
  )
}

export default TopBar
