import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex flex-col items-center justify-center w-full min-h-screen bg-[#fefaf0] text-[var(--orange)] px-4"
      style={{
        background: 'radial-gradient(circle at top left, #fff 0%, #fefaf0 50%, #fefaf0 100%)',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div className="max-w-xl text-center mt-20">
        <h1 className="text-4xl font-bold mb-6">Product Not Found</h1>
        <p className="mb-8">
          Oops! We couldn’t find the phone case you're looking for. 
          It may have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/store"
          className="
            inline-block bg-[var(--orange)]
            text-white px-6 py-3
            rounded-md font-semibold
            hover:bg-[#c85200]
          "
        >
          Return to Store
        </Link>
      </div>
    </main>
  );
}