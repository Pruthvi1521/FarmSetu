import React from 'react';

interface MarketStoryStripProps {
  eyebrow: string;
  title: string;
  description: string;
}

const storyImages = [
  {
    src: 'https://images.pexels.com/photos/20445203/pexels-photo-20445203.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Farmers harvesting crops together in a green field',
    label: 'The field'
  },
  {
    src: 'https://images.pexels.com/photos/20527464/pexels-photo-20527464.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Farmer working among fresh green crops',
    label: 'The harvest'
  },
  {
    src: 'https://images.unsplash.com/photo-1632776350300-11016768b521?auto=format&fit=crop&w=900&q=80',
    alt: 'Colourful vegetables at a farmers market',
    label: 'The mandi'
  }
];

export const MarketStoryStrip: React.FC<MarketStoryStripProps> = ({ eyebrow, title, description }) => (
  <section className="market-story-strip overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#173c29] text-white shadow-lg shadow-emerald-950/10">
    <div className="grid lg:grid-cols-[1.1fr_1.9fr]">
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-200">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-50/85">{description}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-2 sm:p-3">
        {storyImages.map((image) => (
          <figure key={image.label} className="group relative min-h-[150px] overflow-hidden rounded-2xl bg-emerald-900">
            <img
              src={image.src}
              alt={image.alt}
              className="h-full min-h-[150px] w-full object-cover transition duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <figcaption className="absolute bottom-2 left-2 rounded-lg bg-[#12281d]/95 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg">
              {image.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
