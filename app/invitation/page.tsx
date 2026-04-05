'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// 🔥 FIREBASE
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

type MessageItem = {
  name: string
  message: string
  createdAt?: any
}

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

export default function WeddingInvitation() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const [messages, setMessages] = useState<MessageItem[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  useReveal()

  const galleryImages = useMemo(() => ['/1.jpg', '/2.jpg', '/3.jpg'], [])

  // =========================
  // AUDIO
  // =========================
  const playAudio = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      audio.volume = 0.3
      await audio.play()
      setPlaying(true)
      setAudioUnlocked(true)
    } catch (error) {
      console.error('Gagal memutar audio:', error)
      setPlaying(false)
    }
  }

  const pauseAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    setPlaying(false)
  }

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await playAudio()
    } else {
      pauseAudio()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.3
    audio.load()

    const unlockOnFirstInteraction = async () => {
      if (audioUnlocked) return

      try {
        await playAudio()
      } catch (error) {
        console.error(error)
      }

      window.removeEventListener('touchstart', unlockOnFirstInteraction)
      window.removeEventListener('pointerdown', unlockOnFirstInteraction)
      window.removeEventListener('click', unlockOnFirstInteraction)
    }

    window.addEventListener('touchstart', unlockOnFirstInteraction, { passive: true })
    window.addEventListener('pointerdown', unlockOnFirstInteraction)
    window.addEventListener('click', unlockOnFirstInteraction)

    return () => {
      window.removeEventListener('touchstart', unlockOnFirstInteraction)
      window.removeEventListener('pointerdown', unlockOnFirstInteraction)
      window.removeEventListener('click', unlockOnFirstInteraction)
    }
  }, [audioUnlocked])

  // =========================
  // LOCK BODY SAAT LIGHTBOX
  // =========================
  useEffect(() => {
    document.body.style.overflow = selectedImg ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedImg])

  // =========================
  // COUNTDOWN WIB FIX
  // 12 April 2026 09:00 WIB
  // WIB = UTC+7 => UTC = 02:00
  // =========================
  useEffect(() => {
    const targetMs = Date.UTC(2026, 3, 12, 2, 0, 0)

    const updateCountdown = () => {
      const nowMs = Date.now()
      const diff = targetMs - nowMs

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      })
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(interval)
  }, [])

  // =========================
  // FIRESTORE
  // =========================
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))

    const unsub = onSnapshot(q, (snapshot) => {
      const data: MessageItem[] = []
      snapshot.forEach((doc) => {
        data.push(doc.data() as MessageItem)
      })
      setMessages(data)
    })

    return () => unsub()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    await addDoc(collection(db, 'messages'), {
      name: name.trim(),
      message: message.trim(),
      createdAt: new Date(),
    })

    setName('')
    setMessage('')
  }

  const copyRekening = async () => {
    const text = '1330034503920'
  
    try {
      // cara modern
      await navigator.clipboard.writeText(text)
      alert('Nomor rekening berhasil disalin')
    } catch (err) {
      // 🔥 fallback untuk HP jadul / non-https
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
  
        document.execCommand('copy')
        document.body.removeChild(textarea)
  
        alert('Nomor rekening berhasil disalin')
      } catch (err2) {
        // 🔥 fallback terakhir (manual)
        alert('Salin manual ya: ' + text)
      }
    }
  }

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #f8f5f0;
        }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
          will-change: opacity, transform;
        }

        .reveal.show {
          opacity: 1;
          transform: translateY(0);
        }

        .soft-fade {
          animation: softFade 1s ease-out both;
        }

        @keyframes softFade {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .petal {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          opacity: 0.12;
          filter: blur(2px);
          animation: drift 14s linear infinite;
          will-change: transform;
        }

        .petal-1 {
          width: 18px;
          height: 18px;
          left: 12%;
          top: -30px;
          background: #f9a8d4;
          animation-delay: 0s;
        }

        .petal-2 {
          width: 14px;
          height: 14px;
          left: 78%;
          top: -40px;
          background: #fda4af;
          animation-delay: 4s;
        }

        @keyframes drift {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(12px, 50vh, 0) rotate(90deg);
          }
          100% {
            transform: translate3d(-8px, 100vh, 0) rotate(180deg);
          }
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen relative bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat text-gray-900 overflow-x-hidden">
        <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none"></div>

        <audio ref={audioRef} loop preload="auto" playsInline>
          <source src="/lovestory.mp3" type="audio/mpeg" />
        </audio>

        <button
          onClick={toggleMusic}
          aria-label="Toggle music"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-pink-500 to-rose-400 text-white w-14 h-14 rounded-full shadow-lg active:scale-95 transition-transform duration-200 flex items-center justify-center"
        >
          <span className="text-xl">{playing ? '⏸' : '🎵'}</span>
        </button>

        {!audioUnlocked && (
          <div className="fixed bottom-20 right-4 z-50 bg-white/90 text-xs text-gray-800 px-3 py-2 rounded-xl shadow">
            Tap layar untuk mulai musik
          </div>
        )}

        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="petal petal-1" />
          <div className="petal petal-2" />
        </div>

        <div className="relative z-10">
          {/* HERO */}
          <section className="min-h-screen flex flex-col items-center justify-center space-y-8 px-6 py-16 overflow-hidden relative">
            <div className="absolute w-[320px] h-[320px] bg-pink-300 rounded-full blur-[80px] opacity-20 pointer-events-none" />

            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-white p-2 shadow-2xl overflow-hidden">
              <img
                src="/apud.jpg"
                alt="Foto pengantin"
                className="w-full h-full object-cover rounded-full"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>

            <div className="soft-fade bg-white/90 p-6 sm:p-8 rounded-[30px] shadow-xl text-center border border-[#e8dfd3] relative max-w-md w-full">
              <p className="text-gray-800 text-sm tracking-widest">THE WEDDING OF</p>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent mt-2">
                Mahpudin
              </h1>

              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                &
              </h2>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                Elis Fatma Ayu Ningsih
              </h3>

              <p className="mt-2 text-gray-800">12 April 2026</p>
            </div>

            <p className="soft-fade text-gray-800 max-w-md text-center leading-relaxed px-2">
              Di antara jutaan langkah kehidupan, kami dipertemukan,
              dipersatukan, dan kini melangkah bersama menuju masa depan.
              Kehadiran dan doa restu Anda adalah kebahagiaan bagi kami.
            </p>
          </section>

          {/* GALERI */}
          <section className="reveal py-20 px-6 overflow-hidden">
            <h2 className="text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
              Galeri Pengantin
            </h2>

            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 sm:gap-6 w-max pr-6 snap-x snap-mandatory">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    className="relative w-56 h-80 sm:w-60 sm:h-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl snap-center active:scale-[0.98] transition-transform duration-200"
                  >
                    <img
                      src={img}
                      alt={`Galeri ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* LIGHTBOX */}
          {selectedImg && (
            <div
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4"
              onClick={() => setSelectedImg(null)}
            >
              <img
                src={selectedImg}
                alt="Preview galeri"
                className="max-w-[92%] max-h-[85%] rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-5 right-5 text-white text-3xl z-[10000]"
                aria-label="Tutup gambar"
              >
                ✕
              </button>
            </div>
          )}

          {/* MEMPELAI */}
          <section className="reveal py-20 px-6">
            <div className="bg-white/95 p-6 rounded-3xl shadow-xl text-center space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
                Mempelai
              </h2>

              <h3 className="font-bold text-xl text-gray-900">Mahpudin</h3>
              <p className="text-gray-800">Putra dari Bpk. Ajan Apandi & Ibu. Cicih</p>

              <div className="text-pink-400 text-2xl">&</div>

              <h3 className="font-bold text-xl text-gray-900">Elis</h3>
              <p className="text-gray-800">Putri dari Bpk. Oting Wiharya & Ibu. Sumiati</p>
            </div>
          </section>

          {/* ACARA */}
          <section className="reveal py-20 px-6">
            <div className="bg-white/95 p-6 rounded-3xl shadow-xl space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
                Acara
              </h2>

              <div className="p-4 bg-pink-50 rounded-xl text-center">
                <h3 className="font-bold text-gray-900">Akad Nikah</h3>
                <p className="text-gray-800 font-semibold">11:00 - Selesai  </p>
              </div>

              <div className="p-4 bg-[#f7f1ea] rounded-xl text-center">
                <h3 className="font-bold text-gray-900">Resepsi</h3>
                <p className="text-gray-800 font-semibold">11:00 - Selesai</p>
              </div>
            </div>
          </section>

          {/* COUNTDOWN */}
          <section className="reveal py-10 px-6 text-center">
            <h2 className="text-2xl font-semibold text-center mb-4 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
              Menuju Hari H
            </h2>

            <div className="flex justify-center gap-3 sm:gap-4 text-sm sm:text-lg text-gray-900 font-bold flex-wrap">
              <div className="bg-white/80 px-4 py-3 rounded-xl shadow">{timeLeft.days}d</div>
              <div className="bg-white/80 px-4 py-3 rounded-xl shadow">{timeLeft.hours}h</div>
              <div className="bg-white/80 px-4 py-3 rounded-xl shadow">{timeLeft.minutes}m</div>
              <div className="bg-white/80 px-4 py-3 rounded-xl shadow">{timeLeft.seconds}s</div>
            </div>
          </section>

          {/* LOKASI */}
          <section className="reveal py-20 px-6">
            <div className="bg-white/95 p-6 rounded-3xl shadow-xl text-center space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-2 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
                Lokasi
              </h2>

              <p className="text-gray-900 font-medium">
                Kp. Cikemang, RT.01 RW.09, Desa Sukajaya, Kecamatan Sukajaya, Kabupaten Bogor
              </p>

              <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d126818.01585743735!2d106.469015!3d-6.6390995!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e427761e4366f61%3A0xc0c36ba8bcc8b8bc!2sKec.%20Sukajaya%2C%20Kabupaten%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1775389820964!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href="https://maps.app.goo.gl/ejeGDy9H416eunf98"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-gradient-to-r from-pink-500 to-rose-400 text-white px-6 py-2 rounded-full"
              >
                Buka di Google Maps
              </a>
            </div>
          </section>

          {/* HADIAH */}
          <section className="reveal py-10 px-6 text-center space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
              Hadiah Pernikahan
            </h2>

            <p className="text-gray-700 text-sm max-w-md mx-auto leading-relaxed">
              Doa restu Anda merupakan hadiah terindah bagi kami.
              Namun apabila ingin memberikan tanda kasih, dapat melalui:
            </p>

            <div className="w-16 h-[1px] bg-[#b08d57] mx-auto opacity-40" />

            <div className="space-y-2">
              <p className="text-gray-800 text-sm tracking-wide">Bank Mandiri</p>

              <p className="text-2xl font-semibold text-[#b08d57] tracking-[3px] break-all">
                1330034503920
              </p>

              <p className="text-gray-700 text-sm italic">a.n MAHPUDIN</p>
            </div>

            <button
              onClick={copyRekening}
              className="text-sm text-[#b08d57] border-b border-[#b08d57] pb-1 active:opacity-70 transition"
            >
              Salin Nomor
            </button>
          </section>

          {/* UCAPAN */}
          <section className="reveal py-20 px-6 max-w-md mx-auto">
            <div className="bg-white/95 p-6 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-[#b08d57] bg-clip-text text-transparent">
                Ucapan & Doa
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama"
                  className="w-full p-3 border rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-pink-200"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ucapan..."
                  className="w-full p-3 border rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-pink-200 min-h-[120px]"
                />
                <button
                  type="submit"
                  className="bg-pink-500 text-white px-6 py-2 rounded-full active:scale-[0.98] transition-transform"
                >
                  Kirim
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-gray-100 p-3 rounded-xl">
                    <p className="font-bold text-gray-900">{msg.name}</p>
                    <p className="text-gray-800 break-words">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="text-center text-gray-800 pb-10">
            Terima kasih 🤍
          </div>
        </div>
      </div>
    </>
  )
}