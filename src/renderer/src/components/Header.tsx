export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.89 2 10 2.9 10 4s.89 2 2 2 2-.9 2-2-.89-2-2-2zM6 8c-.55 0-1 .45-1 1v6c0 3.31 2.69 6 6 6s6-2.69 6-6V9c0-.55-.45-1-1-1H6z" />
              </svg>
            </div>
            <div className="text-2xl font-semibold">Fresh Squeeze</div>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-700">
            <div className="text-right">
              <div className="font-medium">Barists: Alex</div>
              <div className="text-xs text-gray-400">Zed 7:08 11/05/23</div>
            </div>
            <div className="text-right">
              <div className="font-medium">Becits: 11:28 am</div>
              <div className="text-xs text-gray-400">09.11.8: A10</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
