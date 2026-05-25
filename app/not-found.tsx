"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#F03D3F] to-[#651213] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="mb-8">
          <Image
            src="/logo.webp"
            alt="Tiết Ú Logo"
            width={120}
            height={120}
            className="mx-auto mb-6 opacity-80"
          />
        </div>

        <h1 className="font-meow-script text-5xl md:text-7xl text-white mb-4">
          Oops!
        </h1>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trang không tồn tại
          </h2>
          <p className="text-white/80 text-lg mb-4">
            Rất tiếc, trang bạn đang tìm kiếm không được tìm thấy.
          </p>
          <p className="text-white/60 text-sm">
            Vui lòng kiểm tra lại đường dẫn hoặc liên hệ với quản lý để được hỗ trợ.
          </p>
        </div>

        <div className="text-white/60 text-sm mb-6">
          Mã lỗi: <span className="font-mono">PAGE_NOT_FOUND</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-[#CB2527] font-bold px-8 py-4 rounded-full text-lg hover:bg-white/90 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
