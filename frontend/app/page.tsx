export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl text-gray-800 font-bold mb-4">Aktif Drop Listesi</h1>
      <p className="text-gray-600 mb-6">
        Şu anda yayında olan drop’lar aşağıda listelenmiştir.
      </p>

      <ul className="space-y-3">
        <li className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Drop 1</span>
            <a
              href="/drops/1"
              className="text-blue-600 hover:underline text-sm"
            >
              Detay
            </a>
          </div>
        </li>
        <li className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Drop 2</span>
            <a
              href="/drops/2"
              className="text-blue-600 hover:underline text-sm"
            >
              Detay
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
}
