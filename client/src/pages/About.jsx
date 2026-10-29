import Navbar from '../components/Navbar'

const processes = [
  { name: 'Natural Sourcing', image: '/images/process/Sourcing.webp', desc: 'Directly sourced from trusted local farmers' },
  { name: 'Strict Quality Checks', image: '/images/process/Quality.webp', desc: 'Multi-stage testing for high purity' },
  { name: 'Cold Pressed Extraction', image: '/images/process/Refining.webp', desc: 'Traditional kachi ghani method retained' },
  { name: 'Healthy Filtration', image: '/images/process/Fractionation.webp', desc: 'Natural mesh filtration without chemicals' },
  { name: 'Safe Packaging', image: '/images/process/Packaging.webp', desc: 'Hygienic and leak-proof food grade cans' },
  { name: 'Continuous Research', image: '/images/process/Research.webp', desc: 'Innovating for maximum nutritional retention' },
]

const benefits = [
  {
    icon: '🌿',
    title: '100% Natural Ingredients',
    description:
      'We ensure all mustard seeds are naturally grown and sourced from trusted farms with zero synthetic additives.',
  },
  {
    icon: '🧪',
    title: 'Lab-Tested Purity',
    description:
      'Every batch undergoes strict quality testing for purity, rich natural flavor, essential fatty acids, and hygiene.',
  },
  {
    icon: '⚙️',
    title: 'Cold-Pressed Technology',
    description:
      'Extracted at low temperatures to retain natural antioxidants, essential vitamins, and authentic pungent aroma.',
  },
  {
    icon: '🏆',
    title: 'Trusted For Generations',
    description:
      'Our brand stands on years of unwavering trust, exceptional quality, and customer-first commitment.',
  },
]

const nutritionData = [
  { label: 'Energy', value: '900 kcal' },
  { label: 'Protein', value: '0 g' },
  { label: 'Carbohydrates', value: '0 g' },
  { label: 'Sugar', value: '0 g' },
  { label: 'Total Fat', value: '100 g' },
  { label: 'Saturated Fat', value: '7.8 g' },
  { label: 'Trans Fat', value: '0 g' },
  { label: 'Cholesterol', value: '0 mg' },
  { label: 'Vitamin E', value: '40 mg' },
  { label: 'Vitamin A', value: '750 mcg*' },
  { label: 'Vitamin D2', value: '11.25 mcg*' },
  { label: 'PUFA', value: '28.8 g' },
  { label: 'MUFA', value: '63.4 g' },
]

function About() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800">
      <Navbar />

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section
          className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center px-6 py-24 text-center"
          style={{ backgroundImage: "url('/images/banner-mustard.webp')" }}
        >
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/60 to-black/40" />

          <div className="relative z-10 max-w-4xl">
            <span className="inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md border border-amber-400/30">
              PADAM TRADERS
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-md">
              Pure Mustard Oil,<br />
              <span className="text-amber-400">Crafted with Care.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-amber-100/90 sm:text-lg">
              From natural sourcing to precision packaging — experience untouched purity and authentic taste in every drop.
            </p>
          </div>
        </section>

        {/* Our Core Processes */}
        <section className="px-6 py-16 sm:px-10 lg:px-[8%] lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Quality Assurance
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Our Core Extraction Process
            </h2>
            <div className="mt-3 h-1 w-16 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {processes.map((process, idx) => (
              <article
                key={process.name}
                className="group relative overflow-hidden rounded-3xl border border-amber-200/70 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-400"
              >
                <div className="absolute top-4 right-5 text-4xl font-extrabold text-amber-100 opacity-60 group-hover:text-amber-200/70 transition-colors">
                  0{idx + 1}
                </div>

                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-50/80 p-4 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={process.image}
                    alt={process.name}
                    loading="lazy"
                    className="h-full w-full object-contain filter drop-shadow-sm"
                  />
                </div>

                <h3 className="text-xl font-bold text-stone-800">
                  {process.name}
                </h3>
                
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {process.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="relative bg-gradient-to-b from-[#fff8eb] to-[#fef2d8] px-6 py-16 sm:px-10 lg:px-[8%] lg:py-24 border-y border-amber-200/50">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              The Padam Advantage
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Why Choose PADAM Mustard Oil?
            </h2>
            <div className="mt-3 h-1 w-16 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="flex items-start gap-5 rounded-2xl border border-amber-200/80 bg-white/90 backdrop-blur-sm p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100/70 text-2xl shadow-inner">
                  {benefit.icon}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-stone-600 text-sm sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Nutrition Values Section */}
        <section className="px-6 py-16 sm:px-10 lg:px-[8%] lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Transparency & Health
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Nutritional Values
            </h2>
            <p className="mt-2 text-sm text-stone-500 font-medium">Per 100g serving</p>
            <div className="mt-3 h-1 w-16 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-xl shadow-amber-900/5">
            <div className="bg-amber-800 px-6 py-4 text-white flex justify-between items-center font-bold">
              <span>Nutrient</span>
              <span>Value per 100g</span>
            </div>

            <div className="divide-y divide-amber-100/80">
              {nutritionData.map((item, idx) => (
                <div
                  key={item.label}
                  className={`flex justify-between items-center px-6 py-3.5 text-sm transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'
                  } hover:bg-amber-100/40`}
                >
                  <span className="font-semibold text-stone-700">{item.label}</span>
                  <span className="font-bold text-amber-900">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50/80 px-6 py-3 text-xs text-stone-500 border-t border-amber-200/60 text-center">
              * Recommended Dietary Allowance (RDA) values applied as per FSSAI guidelines.
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About