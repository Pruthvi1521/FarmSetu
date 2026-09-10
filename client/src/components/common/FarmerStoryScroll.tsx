import React, { useEffect, useState } from 'react';

const chapters = [
  {
    number: '01',
    title: 'It starts in the soil.',
    text: 'Every crop begins with someone choosing to grow, care, wait, and try again. FarmSetu starts with that person.',
    image: 'https://images.pexels.com/photos/20445206/pexels-photo-20445206.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Happy farmers harvesting together in a lush Indian field',
    label: 'Grow with joy'
  },
  {
    number: '02',
    title: 'Then comes the harvest.',
    text: 'When the crop is ready, the next decision matters: where to sell, when to move, and what price is fair.',
    image: 'https://images.pexels.com/photos/20445203/pexels-photo-20445203.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Farmers smiling while harvesting crops together',
    label: 'Harvest together'
  },
  {
    number: '03',
    title: 'The market should meet you halfway.',
    text: 'Compare mandis, transport costs, forecasts, and buyer offers in one place — without losing the human story behind the produce.',
    image: 'https://images.unsplash.com/photo-1632776350300-11016768b521?auto=format&fit=crop&w=1400&q=80',
    alt: 'Fresh vegetables arranged in wooden market crates',
    label: 'Prepare for the journey'
  },
  {
    number: '04',
    title: 'A fair deal comes home.',
    text: 'From the field to the mandi to the buyer, FarmSetu helps every harvest travel with more clarity and dignity.',
    image: 'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?auto=format&fit=crop&w=1400&q=80',
    alt: 'Fresh tomatoes and produce at a local market',
    label: 'Reach the right market'
  }
];

export const FarmerStoryScroll: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.chapter);
            setActive(index);
          }
        }),
      { rootMargin: '-35% 0px -45% 0px', threshold: 0 }
    );
    const elements = document.querySelectorAll<HTMLElement>('[data-farmer-chapter]');
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const current = chapters[active];

  return (
    <section className="farmer-story-scroll relative left-1/2 w-screen -translate-x-1/2 pt-16 sm:pt-24" aria-labelledby="story-scroll-heading">
      <div className="mx-auto mb-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-500">The FarmSetu way</p>
        <h2 id="story-scroll-heading" className="mt-2 text-3xl sm:text-5xl font-extrabold text-white">
          From soil to sale, stay close to the story.
        </h2>
      </div>

      <div className="farmer-story-scroll__stage">
        <div className="farmer-story-scroll__visual sticky top-20 z-0 h-[calc(100vh-6rem)] min-h-[560px]">
          <div className="relative h-full w-full overflow-hidden bg-emerald-950">
            {chapters.map((chapter, index) => (
              <img
                key={chapter.image}
                src={chapter.image}
                alt={chapter.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === active ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#10271b]/80 via-[#10271b]/25 to-[#10271b]/35" />
            <div className="absolute inset-0 flex items-center px-6 sm:px-12">
              <div className="farmer-story-copy max-w-xl rounded-[1.5rem] border border-white/20 bg-[#142b20]/92 p-6 text-white shadow-2xl backdrop-blur-md sm:p-8">
                <span className="text-sm font-bold tracking-[.18em] text-emerald-200">{current.number}</span>
                <h3 className="mt-3 text-3xl font-extrabold sm:text-5xl">{current.title}</h3>
                <p className="mt-5 text-base leading-8 text-emerald-50/90 sm:text-lg">{current.text}</p>
                <div className="mt-7 h-1 w-16 rounded-full bg-amber-400" />
              </div>
            </div>
            <div className="image-overlay-text absolute bottom-6 left-6 right-6 flex items-end justify-between rounded-2xl bg-[#142b20]/95 px-4 py-3 text-white shadow-xl backdrop-blur-sm sm:left-auto sm:w-80">
              <span className="text-sm font-bold">{current.label}</span>
              <span className="text-xs font-bold text-emerald-200">{current.number} / 04</span>
            </div>
          </div>
        </div>

        <div className="farmer-story-scroll__chapters relative z-10">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.number}
              data-farmer-chapter
              data-chapter={index}
              className={`farmer-story-chapter mx-auto min-h-[calc(100vh-6rem)] max-w-6xl ${index === active ? 'is-active' : ''}`}
            >
              <span className="sr-only">
                {chapter.title}: {chapter.text}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
