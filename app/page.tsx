'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-pink-200 to-white text-center px-6 z-10">
      <h1 className="text-3xl font-serif mb-4 text-gray-900">
        Undangan Pernikahan
      </h1>

      <h2 className="text-4xl font-bold text-pink-600">
        Apud & Elis
      </h2>

      <p className="mt-4 text-gray-800">
        Kepada Yth. Bapak/Ibu/Saudara/i
      </p>

      <Link
        href="/invitation"
        className="mt-8 relative z-[999] inline-block bg-gradient-to-r from-pink-500 to-rose-400 text-white px-6 py-3 rounded-full shadow-lg active:scale-95 transition"
      >
        Buka Undangan
      </Link>
    </div>
  )
}