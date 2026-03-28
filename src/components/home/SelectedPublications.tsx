/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
    delay?: number;
}

export default function SelectedPublications({ 
    publications, 
    title, 
    enableOnePageMode = false,
    delay = 0.4 
}: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    if (publications.length === 0) {
        return null; // Don't show the section if no publications match the filter
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: index === 0 ? 0 : 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            duration: 0.4, 
                            delay: index === 0 ? delay : delay + 0.2 + (index - 1) * 0.1 
                        }}
                        className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex flex-col md:flex-row gap-6">
                            {pub.preview && (
                                <div className="w-full md:w-40 flex-shrink-0 relative">
                                    <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
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
                                <h3 className="font-tiempos-headline font-medium text-primary mb-2 leading-tight">
                                    {pub.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-1">
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                {author.name}
                                            </span>
                                            {author.superscript ? (
                                                <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>{author.superscript}</sup>
                                            ) : (
                                                author.isCorresponding && <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>†</sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>

                                {pub.affiliations && Object.keys(pub.affiliations).length > 0 && (
                                    <p className="text-[0.75rem] text-neutral-500 dark:text-neutral-500 mb-1 leading-tight">
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
                                    <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-4 leading-relaxed">
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

                                <div className="flex flex-wrap gap-2">
                                    {pub.url && (
                                        <a
                                            href={pub.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                        >
                                            <img src="/arxiv-logomark-small@2x.png" alt="arXiv" className="h-2.5 w-auto mr-1" />
                                            Paper
                                        </a>
                                    )}
                                    {pub.code && (
                                        <a
                                            href={pub.code}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                        >
                                            <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 block dark:hidden" />
                                            <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 hidden dark:block" />
                                            Code
                                        </a>
                                    )}
                                    {pub.project && (
                                        <a
                                            href={pub.project}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                        >
                                            <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 block dark:hidden" />
                                            <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 hidden dark:block" />
                                            Project
                                        </a>
                                    )}
                                    {pub.dataset && (
                                        <a
                                            href={pub.dataset}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-transparent dark:border-neutral-700 shadow-sm transition-all"
                                        >
                                            <img src="/GitHub_Invertocat_Black.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 block dark:hidden" />
                                            <img src="/GitHub_Invertocat_White.png" alt="GitHub" className="h-2.5 w-2.5 mr-1 hidden dark:block" />
                                            Dataset
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
