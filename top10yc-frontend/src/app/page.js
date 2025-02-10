'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const searchExamples = [
    "Startups using AI for education...",
    "Browser agents building global APIs...",
    "Companies integrating AI and robotics...",
    "Voice agents for healthcare...",
    "Machine learning developer tools..."
  ];

  useEffect(() => {
    let currentText = '';
    let currentIndex = 0;
    let isTyping = true;
    let timeout;

    const animateText = () => {
      const targetText = searchExamples[currentExampleIndex];

      if (isTyping) {
        if (currentIndex < targetText.length) {
          currentText = targetText.slice(0, currentIndex + 1);
          currentIndex++;
          timeout = setTimeout(animateText, 50); // Speed of typing
        } else {
          isTyping = false;
          timeout = setTimeout(animateText, 2000); // Wait 2 seconds when done typing
        }
      } else {
        if (currentIndex > 0) {
          currentText = targetText.slice(0, currentIndex - 1);
          currentIndex--;
          timeout = setTimeout(animateText, 30); // Speed of erasing
        } else {
          isTyping = true;
          setCurrentExampleIndex((prev) => (prev + 1) % searchExamples.length);
          timeout = setTimeout(animateText, 500); // Wait half second before starting next word
        }
      }

      setTypingText(currentText);
    };

    timeout = setTimeout(animateText, 100);

    return () => clearTimeout(timeout);
  }, [currentExampleIndex]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setCompanies([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          limit: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.companies) {
        setCompanies(data.companies.map(match => ({
          ...match.metadata,
          score: match.score
        })));
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setError(error.message);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <div className={`flex-1 flex flex-col transition-all duration-700 ease-in-out ${!hasSearched ? 'justify-center' : 'justify-start pt-8'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className={`text-center transition-all duration-700 ease-in-out ${!hasSearched ? 'mb-8' : 'mb-6 scale-90'}`}>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gray-900">Top10</span>
              <span className="text-[var(--yc-orange)]">YC</span>
            </h1>
            <div className="text-gray-600 text-xl max-w-2xl mx-auto">
              Better Search for the Y Combinator Startup Directory
            </div>
          </header>

          <div className={`text-center transition-all duration-700 ease-in-out ${!hasSearched ? 'mb-16 scale-100' : 'mb-8 scale-90'}`}>
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Find your top 10 YC companies..."
                className="w-full px-6 py-4 pr-16 border-2 border-gray-200 rounded-full text-lg transition-all focus:outline-none focus:border-[var(--yc-orange-light)] focus:ring-2 focus:ring-[var(--yc-orange-light)] focus:ring-opacity-20 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--yc-orange)] transition-colors"
                aria-label="Search"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-6 h-6"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" 
                  />
                </svg>
              </button>
            </div>
            {!hasSearched && (
              <div className="mt-4 text-gray-500 transition-opacity duration-700 h-6">
                <span className="font-medium">Search for </span>
                <span className="text-[var(--yc-orange)]">{typingText}</span>
                <span className="animate-blink">|</span>
              </div>
            )}
          </div>

          <div className={`transition-all duration-700 ease-in-out ${hasSearched ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {isLoading ? (
              <div className="text-center text-gray-600">
                Searching companies...
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                Error: {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {companies.map((company, index) => (
                  <div 
                    key={company.name} 
                    className="bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 relative border border-gray-100 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-md opacity-0 animate-slideIn"
                    onClick={() => window.open(`https://www.ycombinator.com/companies/${company.name}`, '_blank')}
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="company-number">{index + 1}</div>
                    <div className="flex items-center gap-5 mb-5">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={`${company.name} logo`}
                          className="w-16 h-16 rounded-lg object-contain border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-semibold text-gray-400">${company.name[0]}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-semibold text-gray-400">
                          {company.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-[var(--yc-orange)] font-semibold mb-1">
                          {company.name}
                        </div>
                        <div className="text-xl font-bold text-gray-800">
                          {company.header}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {company.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {company.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
