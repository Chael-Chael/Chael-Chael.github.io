/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                {/* ... (keep existing controls) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-100 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-100 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-200/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications Grid */}
            <div className="space-y-6">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => (
                        <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className="bg-white dark:bg-neutral-100 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {pub.preview && (
                                    <div className="w-full md:w-48 flex-shrink-0 relative">
                                        <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-100">
                                            <img
                                                src={`/papers/${pub.preview}`}
                                                alt={pub.title}
                                                className="w-full h-auto object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                        {pub.badge && (
                                            <div className="mt-2 flex justify-center">
                                                <div className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded border border-accent/20">
                                                    {pub.badge}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-tiempos-headline font-medium text-primary mb-2 leading-tight`}>
                                        {pub.title}
                                    </h3>
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-600 mb-2`}>
                                        {pub.authors.map((author, idx) => (
                                            <span key={idx}>
                                                <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                    {author.name}
                                                </span>
                                                {author.superscript ? (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>{author.superscript}</sup>
                                                ) : (
                                                    author.isCorresponding && <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                                )}
                                                {idx < pub.authors.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </p>

                                    {pub.affiliations && Object.keys(pub.affiliations).length > 0 && (
                                        <p className="text-[0.75rem] text-neutral-500 dark:text-neutral-500 mb-2 leading-tight">
                                            {Object.entries(pub.affiliations).map(([key, value], idx, arr) => (
                                                <span key={key}>
                                                    <sup>{key}</sup>{value}
                                                    {idx < arr.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                    <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-3 font-tiempos italic">
                                        {pub.journal || pub.conference}
                                    </p>

                                    {pub.description && (
                                        <div className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 leading-relaxed">
                                            <ReactMarkdown 
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                    a: ({ ...props }) => <a {...props} className="text-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                                                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                                                    em: ({ children }) => <em className="font-tiempos italic text-neutral-600 dark:text-neutral-500">{children}</em>,
                                                }}
                                            >
                                                {pub.description}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {pub.url && (
                                            <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-100 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                            >
                                                <img src="/arxiv-logomark-small@2x.png" alt="arXiv" className="h-3 w-auto mr-1.5" />
                                                Paper
                                            </a>
                                        )}
                                        {pub.code && (
                                            <a
                                                href={pub.code}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-100 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                            >
                                                <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-3 w-3 mr-1.5 block dark:hidden" />
                                                <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-3 w-3 mr-1.5 hidden dark:block" />
                                                Code
                                            </a>
                                        )}
                                        {pub.project && (
                                            <a
                                                href={pub.project}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-100 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                            >
                                                <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-3 w-3 mr-1.5 block dark:hidden" />
                                                <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-3 w-3 mr-1.5 hidden dark:block" />
                                                Project
                                            </a>
                                        )}
                                        {pub.dataset && (
                                            <a
                                                href={pub.dataset}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-100 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                            >
                                                <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-3 w-3 mr-1.5 block dark:hidden" />
                                                <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-3 w-3 mr-1.5 hidden dark:block" />
                                                Dataset
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
