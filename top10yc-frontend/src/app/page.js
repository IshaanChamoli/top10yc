'use client';
import { useState } from 'react';

// Temporary mock data - you'll replace this with real data later
const mockCompanies = [
  {
    name: "Example Company 1",
    header: "Making AI accessible to everyone",
    description: "A platform that helps developers integrate AI into their applications with simple APIs and powerful tools.",
    tags: ["AI", "Developer Tools", "SaaS"],
    logo_url: null
  },
  {
    name: "Example Company 2",
    header: "Next-generation payment infrastructure",
    description: "Building the future of financial technology with modern payment solutions for businesses of all sizes.",
    tags: ["Fintech", "Payments", "B2B"],
    logo_url: null
  },
  // Add more mock companies as needed
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCompanies = mockCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[var(--yc-orange)] mb-2">
          YC Companies Directory
        </h1>
        <div className="text-gray-600 text-lg">
          Explore Y Combinator's portfolio companies
        </div>
      </header>

      <div className="mb-8 text-center">
        <input
          type="text"
          placeholder="Search companies by name, description, or tags..."
          className="w-full max-w-2xl px-6 py-4 border-2 border-gray-200 rounded-full text-lg transition-all focus:outline-none focus:border-[var(--yc-orange-light)] focus:ring-2 focus:ring-[var(--yc-orange-light)] focus:ring-opacity-20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="text-center text-gray-600 mb-6">
        Showing {filteredCompanies.length} companies
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company, index) => (
          <div key={company.name} className="company-card">
            <div className="company-number">{index + 1}</div>
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 text-xl font-semibold text-gray-400">
                {company.name[0]}
              </div>
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
    </div>
  );
}
