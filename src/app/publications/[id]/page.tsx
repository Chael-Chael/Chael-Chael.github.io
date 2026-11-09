import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicationDetail from '@/components/flow/PublicationDetailPage';
import { getAllPublications, getPublicationById, getPublicationPreview, getPublicationVenue } from '@/lib/showcase';
import type { DetailLink, DetailPair } from '@/types/showcase';
import type { Publication } from '@/types/publication';

function buildDetails(publication: Publication): DetailPair[] {
  const venue = getPublicationVenue(publication);
  const details: DetailPair[] = [];

  if (venue) details.push({ label: 'Venue', value: venue });
  if (publication.year) details.push({ label: 'Year', value: String(publication.year) });
  if (publication.badge) details.push({ label: 'Area', value: publication.badge });
  if (publication.affiliations && Object.keys(publication.affiliations).length > 0) {
    details.push({
      label: 'Affiliations',
      value: Object.entries(publication.affiliations)
        .map(([key, value]) => `${key}. ${value}`)
        .join(' / '),
    });
  }

  return details;
}

function buildLinks(publication: Publication): DetailLink[] {
  return [
    publication.url ? { label: 'Paper', href: publication.url } : null,
    publication.code ? { label: 'Code', href: publication.code } : null,
    publication.project ? { label: 'Project', href: publication.project } : null,
    publication.dataset ? { label: 'Dataset', href: publication.dataset } : null,
  ].filter((item): item is DetailLink => Boolean(item));
}

export function generateStaticParams() {
  return getAllPublications().map((publication) => ({ id: publication.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const publication = getPublicationById(id);

  if (!publication) {
    return { title: 'Publication Not Found' };
  }

  return {
    title: publication.title,
    description: publication.description || publication.summary || publication.abstract,
  };
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publication = getPublicationById(id);

  if (!publication) {
    notFound();
  }

  return (
    <PublicationDetail
      publication={publication}
      coverKey={`publications:${publication.id}`}
      venue={getPublicationVenue(publication)}
      cover={getPublicationPreview(publication)}
      details={buildDetails(publication)}
      links={buildLinks(publication)}
    />
  );
}
