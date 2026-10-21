
import Navbar from '../components/Navbar'

const processes = [
  { name: 'Natural Sourcing', image: '/images/process/Sourcing.webp' },
  { name: 'Strict Quality Checks', image: '/images/process/Quality.webp' },
  { name: 'Cold Pressed Extraction', image: '/images/process/Refining.webp' },
  { name: 'Healthy Filtration', image: '/images/process/Fractionation.webp' },
  { name: 'Safe Packaging', image: '/images/process/Packaging.webp' },
  { name: 'Continuous Research', image: '/images/process/Research.webp' },
]

const benefits = [
  {
    title: '🌿 100% Natural Ingredients',
    description:
      'We ensure all mustard seeds are naturally grown and sourced from trusted farms.',
  },
  {
    title: '🧪 Lab-Tested Purity',
    description:
      'Every batch undergoes strict quality testing for purity, nutrients, and hygiene.',
  },
  {
    title: '⚙️ Cold-Pressed Technology',
    description:
      'Retains all natural antioxidants, vitamins, and aroma without chemicals.',
  },
  {
    title: '🏆 Trusted For Generations',
    description:
      'Our brand stands on years of trust, quality, and customer commitment.',
  },
]

const nutrition = [
  [
    'Energy: 900 kcal',
    'Protein: 0g',
    'Carbohydrates: 0g',
    'Sugar: 0g',
    'Fat: 100%',
    'Saturated Fat: 7.8g',
    'Trans Fat: 0g',
  ],
  [
    'Cholesterol: 0 mg',
    'Vitamin E: 40 mg',
    'Vitamin A: 750 mcg*',
    'Vitamin D2: 11.25 mcg*',
    'PUFA: 28.8g',
    'MUFA: 63.4g',
  ],
]

function About() {
  return (
    <>
      <Navbar />

      <main className="bg-[#fffdf5] text-stone-800">
        {/* Hero */}
        <section
          className="relative flex min-h-[55vh] items-center justify-center bg-cover bg-center px-5 py-20"
          style={{ backgroundImage: "url('/images/banner-mustard.webp')" }}
        >
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 max-w-3xl text-center text-[#fffde8]">
            <h1 className="text-3xl font-extrabold tracking-wide sm:text-4xl md:text-5xl">
              Pure Mustard Oil, Crafted with Care
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-xl">
              From natural sourcing to precision packaging — experience
              purity in every step.
            </p>
          </div>
        </section>

        {/* Processes */}
        <section className="px-5 py-14 sm:px-10 lg:px-[8%] lg:py-16">
          <h2 className="mb-10 text-center text-3xl font-bold text-[#cc8a00]">
            Our Core Processes
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processes.map((process) => (
              <article
                key={process.name}
                className="rounded-2xl border border-amber-200/80 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                <img
                  src={process.image}
                  alt={process.name}
                  loading="lazy"
                  className="mx-auto h-[75px] w-[75px] object-contain"
                />
                <h3 className="mt-4 text-lg font-semibold text-stone-700">
                  {process.name}
                </h3>
              </article>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-[#fff7e1] px-5 py-14 sm:px-10 lg:px-[8%] lg:py-16">
          <h2 className="mb-10 text-center text-3xl font-bold text-[#cc8a00]">
            Why Choose PADAM Mustard Oil?
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="mb-3 text-xl font-semibold text-[#c28700]">
                  {benefit.title}
                </h3>
                <p className="leading-relaxed text-stone-600">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Nutrition */}
        <section className="px-5 py-14 sm:px-10 lg:px-[8%] lg:py-16">
          <h2 className="mb-10 text-center text-3xl font-bold text-[#cc8a00]">
            Nutritional Values (Per 100g)
          </h2>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {nutrition.map((items, index) => (
              <div
                key={index}
                className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
              >
                <ul>
                  {items.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[#f7f1d2] py-3 text-stone-700 last:border-b-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default About
