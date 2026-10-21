
function Hero() {
  return (
    <section className="relative flex min-h-[430px] items-center overflow-hidden bg-[#281914] sm:min-h-[520px]">
      <img
        src="/images/slide3.jpg"
        alt="PADAM Traders mustard oil"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
        <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-amber-300">
          Welcome to PADAM Traders
        </p>

        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Pure. Fresh. Authentic Mustard Oil.
        </h1>

        <p className="mt-5 max-w-xl text-lg text-amber-50">
          From farm to kitchen — the quality you can trust.
        </p>

        <a
          href="/products"
          className="mt-8 inline-block rounded-lg bg-amber-400 px-7 py-3 font-bold text-stone-950 transition hover:bg-amber-300"
        >
          View Products →
        </a>
      </div>
    </section>
  )
}

export default Hero
