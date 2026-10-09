const benefits = [
  {
    title: "Quality Furniture",
    description:
      "Carefully selected furniture designed to bring comfort and durability to your home.",
  },
  {
    title: "Easy Shopping",
    description:
      "Browse our collection easily and find furniture that fits your style and space.",
  },
  {
    title: "Secure Shopping",
    description:
      "Your shopping experience is designed with security and privacy in mind.",
  },
  {
    title: "Customer Support",
    description:
      "We're here to help you choose the right furniture for your home.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Why FurniStore
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Furniture Shopping Made Simple
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            From discovering your favorite pieces to getting them home,
            we make furniture shopping simple and enjoyable.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-white p-7 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                ✓
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}