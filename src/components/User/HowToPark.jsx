
const HowToPark = () => {
  const steps = [
    { title: 'Look', desc: 'Find nearby parking spaces easily.', icon: "https://images.prismic.io/spothero/75c23d5f-4186-47e7-a509-1de92d779b7a_8a7dbd48-4df5-4a26-9a76-611d8183bd86_faq-map.webp?auto=compress,format" },
    { title: 'Book', desc: 'Reserve your spot in advance.', icon: "https://images.prismic.io/spothero/290a7d11-ef71-4c4a-8caf-5a5bfc390deb_d837206c-d8de-4b0c-a491-2ba5b94563df_faq-pass.webp?auto=compress,format" },
    { title: 'Park', desc: 'Arrive and park without hassle.', icon: "https://images.prismic.io/spothero/b0651627-3881-4d29-8c9a-2519e73be525_e8b36b04-1ad0-406a-b609-63ace2e3937e_faq-car.webp?auto=compress,format" },
  ];

  return (
    <section className="mt-24 px-4">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-20 tracking-tight">How EZPark Works</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-20">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center max-w-[260px]">
            <img src={step.icon} alt={step.title} className="h-24 w-24 mb-6 drop-shadow-md" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{step.title}</h3>
            <p className="text-base text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowToPark;
