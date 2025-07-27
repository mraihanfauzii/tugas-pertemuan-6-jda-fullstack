import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative z-10 bg-white py-[120px]">
      <div className="container mx-auto">
        <div className="flex -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[400px] text-center">
              <h2 className="mb-2 text-[50px] font-bold leading-none text-blue-600 sm:text-[80px] md:text-[100px]">
                404
              </h2>
              <h4 className="mb-3 text-[22px] font-semibold leading-tight text-black">
                Oops! That page can’t be found.
              </h4>
              <p className="mb-8 text-lg text-body-color">
                The page you are looking for it might be deleted.
              </p>
              {/* Perbaikan di bawah ini */}
              <Link href="/" className="inline-block px-8 py-3 bg-blue-600 border border-current text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}