export interface StoreLink {
  platform: 'APKPure' | 'Uptodown' | 'OPPO Store' | 'Google Play' | 'App Store' | 'Web App';
  url: string;
}

export interface ProjectScreenshot {
  id: string;
  label: string;
  imageUrl: string;
  caption?: string;
}

export interface StudioProject {
  id: string;
  index: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  technologies: string[];
  year: string;
  status: string;
  featuredImage: string;
  gallery: ProjectScreenshot[];
  storeLinks: StoreLink[];
  published: boolean;
}

export const INITIAL_PROJECTS: StudioProject[] = [
  {
    id: 'cod-finder',
    index: '01',
    title: 'COD Finder',
    slug: 'cod-finder',
    subtitle: 'A real R & L Studio project.',
    description:
      'Project overview editable — add the product summary, problem statement, and core user journey for COD Finder.',
    category: 'Mobile Application',
    technologies: ['Editable Stack Slot'],
    year: '2026',
    status: 'Published — Editable',
    featuredImage: '/src/assets/images/cod_finder_showcase_1794914852787.jpg',
    gallery: [
      {
        id: 'cod-screen-1',
        label: 'Primary Presentation',
        imageUrl: '/src/assets/images/cod_finder_showcase_1794914852787.jpg',
        caption: 'Replace with COD Finder screen capture',
      },
      {
        id: 'cod-screen-2',
        label: 'Interface Slot 02',
        imageUrl: '',
        caption: 'Add secondary application screenshot URL',
      },
    ],
    storeLinks: [
      { platform: 'APKPure', url: '' },
      { platform: 'Uptodown', url: '' },
      { platform: 'OPPO Store', url: '' },
    ],
    published: true,
  },
  {
    id: 'ipay-finder',
    index: '02',
    title: 'Ipay Finder',
    slug: 'ipay-finder',
    subtitle: 'A real R & L Studio project.',
    description:
      'Project overview editable — add the product summary, design direction, and delivery scope for Ipay Finder.',
    category: 'Mobile Application',
    technologies: ['Editable Stack Slot'],
    year: '2026',
    status: 'In Studio Portfolio — Editable',
    featuredImage: '/src/assets/images/ipay_finder_showcase_1794914852939.jpg',
    gallery: [
      {
        id: 'ipay-screen-1',
        label: 'Primary Presentation',
        imageUrl: '/src/assets/images/ipay_finder_showcase_1794914852939.jpg',
        caption: 'Replace with Ipay Finder screen capture',
      },
      {
        id: 'ipay-screen-2',
        label: 'Interface Slot 02',
        imageUrl: '',
        caption: 'Add secondary application screenshot URL',
      },
    ],
    storeLinks: [
      { platform: 'APKPure', url: '' },
      { platform: 'Uptodown', url: '' },
      { platform: 'OPPO Store', url: '' },
    ],
    published: true,
  },
];
