const navigation = {
  company: [
    { name: "About", href: "/about" },
    { name: "Podcasts", href: "/podcasts" },
    { name: "Tags", href: "/tags" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Support", href: "/support" },
  ],
  popularPodcasts: [
    { name: "Modern Wisdom", href: "/podcasts/chris-williamson" },
    { name: "The Diary Of a CEO", href: "/podcasts/doac" },
    { name: "The Tim Ferriss Show", href: "/podcasts/tim-ferriss" },
    { name: "The Mel Robbins Podcast", href: "/podcasts/mel-robbins" },
    { name: "On Purpose with Jay Shetty", href: "/podcasts/jay-shetty" },
    { name: "The School of Greatness", href: "/podcasts/lewis-howes" },
    { name: "Feel Better, Live More", href: "/podcasts/rangan-chatterjee" },
  ],
  legal: [
    { name: "Terms of service", href: "/terms-of-service" },
    { name: "Privacy policy", href: "/privacy-policy" },
    { name: "Refund policy", href: "/refund-policy" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <svg
              width="25"
              height="25"
              viewBox="40 60 55 85"
              xmlns="http://www.w3.org/2000/svg"
              className="text-sky-600"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M79.43 86C76.6635 79.0001 72.5528 72.6098 67.3301 67.19L91 65.58C85.7145 71.4716 81.7673 78.4379 79.43 86ZM76.77 98.11L82.6501 97.3C82.6501 84.21 93.8901 64.5 105.65 60.54C105.65 64.7 105.44 87.29 105.44 99.69C105.44 133.17 87.84 145.92 47.5 146.36C52.73 141.28 60.35 133.1 60.35 122.11C60.35 109.43 56.6701 100.45 44.7401 99.58L44.3 60.63H46.76C63.33 64.67 76.77 83.93 76.77 98.11ZM96.0801 81.56C89.16 81.56 88.83 92.09 96.2 92.09C102.93 92.09 103 81.56 96.0801 81.56ZM94.5801 109.42L87.84 109.79L89.53 118.87L91.96 119.34L94.5801 109.42ZM85.74 132.53L87.74 133.53L90.2601 124.92L83.71 124.61L85.74 132.53ZM83.3301 110L76.53 110.37L78.34 118.84L81.0801 118.99L83.3301 110ZM75.3301 132.86L77.74 133.08L79.52 124.39L73.18 124.1L75.3301 132.86ZM67.5101 119L70.2901 118.48L72.1601 110.66L66.1601 110.98L67.5101 119ZM60.3 79.17C49.3 79.17 48.7701 95.92 60.4901 95.92C71.2001 95.92 71.2701 79.17 60.3 79.17ZM55.53 122.55C55.53 132.16 49.1201 137.8 45.3101 141.43L44.85 104.69C53.33 105.35 55.53 112.62 55.53 122.55Z"
                fill="currentColor"
              />
            </svg>
            <p className="text-sm/6 text-balance text-gray-400">
              Discover insights from the world&apos;s best podcasts.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm/6 font-semibold text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm/6 text-gray-400 hover:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm/6 font-semibold text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm/6 text-gray-400 hover:text-gray-300"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm/6 font-semibold text-white">
                Popular Podcasts
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.popularPodcasts.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm/6 text-gray-400 hover:text-gray-300"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm/6 text-gray-400">
            &copy; {currentYear} Podwise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
