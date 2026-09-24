import { Injectable, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AudienceLink,
  Faculty,
  FeatureCard,
  Leader,
  NavGroup,
  NavLink,
  NewsArticle,
  QuickAction,
  ResearchItem,
  SearchResult,
  SectionContent,
  Statistic,
  UniversityEvent,
  CourseSummary,
} from '../models/university.models';
import { LocaleService } from './locale.service';

const img = {
  logo: '/assets/brand/hu-logo.png',
  hero: '/assets/campus/hero.png',
  study: '/assets/campus/study.png',
  life: '/assets/campus/life.png',
  faculty: '/assets/campus/faculty.png',
  campus: '/assets/images/campus.jpg',
  campusAlt: '/assets/campus/hero.png',
  library: '/assets/images/library.jpg',
  lab: '/assets/images/research.jpg',
  students: '/assets/images/students.jpg',
  studyAlt: '/assets/images/study.jpg',
  graduate: '/assets/images/graduate.jpg',
  online: '/assets/images/online.jpg',
  continuing: '/assets/images/continuing.jpg',
  globe: '/assets/images/globe.jpg',
  college1: '/assets/images/college1.jpg',
  college2: '/assets/images/college2.jpg',
  college3: '/assets/images/college3.jpg',
  college4: '/assets/images/college4.jpg',
  news1: '/assets/images/news1.jpg',
  news2: '/assets/images/news2.jpg',
  news3: '/assets/images/news3.jpg',
  news4: '/assets/images/news4.jpg',
};

type ApiPublicSite = {
  studentCount: number;
  staffCount: number;
  facultyCount: number;
  courseCount: number;
  profile: {
    brandNameAr: string;
    brandNameEn: string;
    tagline: string;
    taglineEn?: string;
    aboutIntro: string;
    aboutIntroEn?: string;
    addressLines: string;
    addressLinesEn?: string;
    phone: string;
    email: string;
    website: string;
    heroImageUrl: string;
    globalImageUrl: string;
    presidentName: string;
    presidentTitle: string;
    presidentTitleEn?: string;
  };
  faculties: {
    id: string;
    slug: string;
    name: string;
    arabicName: string;
    dean: string;
    description: string;
    imageUrl: string;
  }[];
  news: {
    id: string;
    category: string;
    categoryEn?: string;
    title: string;
    titleEn?: string;
    summary: string;
    summaryEn?: string;
    imageUrl: string;
    publishedLabel: string;
    isFeatured: boolean;
  }[];
  events: {
    id: string;
    day: string;
    month: string;
    monthEn?: string;
    title: string;
    titleEn?: string;
    location: string;
    locationEn?: string;
    category: string;
    categoryEn?: string;
  }[];
};

@Injectable({ providedIn: 'root' })
export class UniversityDataService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);

  /** Last successful public API payload for locale remapping. */
  private siteSnapshot: ApiPublicSite | null = null;

  brandName = 'جامعة الغردقة';
  brandNameEn = 'Hurghada University';
  private taglineAr = 'نحو تميز أكاديمي يخدم البحر الأحمر ومصر';
  private taglineEn = 'Toward academic excellence serving the Red Sea and Egypt';
  tagline = this.taglineAr;
  private aboutIntroAr =
    'بدأت الدراسة بفرع الغردقة بكلية التربية عام 1995، ثم خُصصت 500 فدان للحرم، وصدر قرار إنشاء جامعة الغردقة رقم 3005 لسنة 2024.';
  private aboutIntroEn =
    'Studies began at the Hurghada branch Faculty of Education in 1995; 500 acres were allocated for campus; Decree 3005 of 2024 established Hurghada University.';
  aboutIntro = this.aboutIntroAr;
  readonly logoUrl = img.logo;
  private addressLinesAr = ['جامعة الغردقة', 'شمال مدينة الغردقة', 'محافظة البحر الأحمر', 'جمهورية مصر العربية'];
  private addressLinesEn = [
    'Hurghada University',
    'North Hurghada City',
    'Red Sea Governorate',
    'Arab Republic of Egypt',
  ];
  addressLines = [...this.addressLinesAr];
  phone = '+20 65 0000000';
  email = 'info@hurghada.edu.eg';
  website = 'http://www.hurghada.edu.eg/';
  apiReady = false;

  constructor() {
    effect(() => {
      this.locale.lang();
      this.locale.ready();
      if (this.siteSnapshot) {
        this.applySiteSnapshot(this.siteSnapshot);
      } else {
        this.applySeedStatsAndLists();
      }
      this.rematerializeKeyBasedLists();
    });
  }

  /** Prefer EN when locale is English; fall back to AR (and vice versa). */
  localized(ar: string | null | undefined, en: string | null | undefined): string {
    const a = (ar ?? '').trim();
    const e = (en ?? '').trim();
    return this.locale.lang() === 'en' ? e || a : a || e;
  }

  resolveMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    const trimmed = path.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
    if (trimmed.startsWith('/uploads/')) return `${environment.apiUrl}${trimmed}`;
    return trimmed;
  }

  readonly utilityLinks: NavLink[] = [
    { labelKey: 'utility.home', path: '/' },
    { labelKey: 'utility.agenda', path: '/agenda' },
    { labelKey: 'utility.links', path: '/links' },
    { labelKey: 'utility.contact', path: '/contact' },
    { labelKey: 'utility.portal', path: '/portal' },
    { labelKey: 'utility.email', path: 'mailto:info@hurghada.edu.eg' },
  ];

  readonly mainNav: NavGroup[] = [
    {
      labelKey: 'nav.home',
      path: '/',
      children: [],
    },
    {
      labelKey: 'nav.faculties',
      path: '/faculties',
      children: [
        { labelKey: 'nav.faculties.edu', path: '/faculties/edu' },
        { labelKey: 'nav.faculties.tourism', path: '/faculties/tourism' },
        { labelKey: 'nav.faculties.alsun', path: '/faculties/alsun' },
        { labelKey: 'nav.faculties.fci', path: '/faculties/fci' },
        { labelKey: 'nav.faculties.sci', path: '/faculties/sci' },
        { labelKey: 'nav.faculties.all', path: '/faculties' },
      ],
    },
    {
      labelKey: 'nav.academic',
      path: '/academic',
      children: [
        { labelKey: 'nav.academic.programs', path: '/academic/programs' },
        { labelKey: 'nav.academic.graduate', path: '/academic/graduate' },
        { labelKey: 'nav.academic.services', path: '/academic/services' },
        { labelKey: 'nav.academic.quality', path: '/academic/quality' },
        { labelKey: 'nav.academic.eservices', path: '/e-services' },
      ],
    },
    {
      labelKey: 'nav.research',
      path: '/research',
      children: [
        { labelKey: 'nav.research.centres', path: '/research/centres' },
        { labelKey: 'nav.research.projects', path: '/research/projects' },
        { labelKey: 'nav.research.libraries', path: '/research/libraries' },
        { labelKey: 'nav.research.awards', path: '/research/awards' },
      ],
    },
    {
      labelKey: 'nav.students',
      path: '/students',
      children: [
        { labelKey: 'nav.students.services', path: '/students/services' },
        { labelKey: 'nav.students.activities', path: '/students/activities' },
        { labelKey: 'nav.students.health', path: '/students/health' },
        { labelKey: 'nav.students.scholarships', path: '/students/scholarships' },
      ],
    },
    {
      labelKey: 'nav.community',
      path: '/community',
      children: [
        { labelKey: 'nav.community.units', path: '/community/units' },
        { labelKey: 'nav.community.service', path: '/community' },
        { labelKey: 'nav.community.guide', path: '/community/guide' },
      ],
    },
    {
      labelKey: 'nav.staff',
      path: '/staff',
      children: [
        { labelKey: 'nav.staff.faculty', path: '/staff' },
        { labelKey: 'nav.staff.military', path: '/staff/military' },
        { labelKey: 'nav.staff.services', path: '/staff/services' },
      ],
    },
    {
      labelKey: 'nav.about',
      path: '/about',
      children: [
        { labelKey: 'nav.about.history', path: '/about/history' },
        { labelKey: 'nav.about.facts', path: '/about/facts' },
        { labelKey: 'nav.about.leadership', path: '/about/leadership' },
        { labelKey: 'nav.about.landmarks', path: '/about/landmarks' },
      ],
    },
  ];

  get mainNavFlat(): NavLink[] {
    return this.mainNav.map((g) => ({ labelKey: g.labelKey, path: g.path }));
  }

  readonly quickActions: QuickAction[] = [
    { id: 'fac', titleKey: 'home.actions.faculties', path: '/faculties', variant: 'primary' },
    { id: 'sci', titleKey: 'home.actions.scienceOpening', path: '/faculties/sci', variant: 'teal' },
    { id: 'eservices', titleKey: 'home.actions.portal', path: '/portal', variant: 'wide' },
    { id: 'tour', titleKey: 'home.actions.tourism', path: '/faculties/tourism', variant: 'primary' },
    { id: 'ai', titleKey: 'home.actions.ai', path: '/faculties/fci', variant: 'orange' },
    { id: 'news', titleKey: 'home.actions.news', path: '/news', variant: 'teal' },
    { id: 'about', titleKey: 'home.actions.about', path: '/about', variant: 'lime' },
  ];

  readonly audienceLinks: AudienceLink[] = [
    {
      titleKey: 'home.audience.currentStudents.title',
      descriptionKey: 'home.audience.currentStudents.desc',
      path: '/students',
    },
    {
      titleKey: 'home.audience.newStudents.title',
      descriptionKey: 'home.audience.newStudents.desc',
      path: '/academic/programs',
    },
    {
      titleKey: 'home.audience.faculty.title',
      descriptionKey: 'home.audience.faculty.desc',
      path: '/staff',
    },
    {
      titleKey: 'home.audience.researchers.title',
      descriptionKey: 'home.audience.researchers.desc',
      path: '/research',
    },
    {
      titleKey: 'home.audience.visitors.title',
      descriptionKey: 'home.audience.visitors.desc',
      path: '/visitors',
    },
    {
      titleKey: 'home.audience.partners.title',
      descriptionKey: 'home.audience.partners.desc',
      path: '/community',
    },
  ];

  private readonly studyCardSeeds = [
    {
      id: 'edu',
      categoryKey: 'home.study.categoryFaculty',
      titleKey: 'home.study.edu.title',
      descriptionKey: 'home.study.edu.desc',
      image: img.study,
      path: '/faculties/edu',
    },
    {
      id: 'tour',
      categoryKey: 'home.study.categoryFaculty',
      titleKey: 'home.study.tourism.title',
      descriptionKey: 'home.study.tourism.desc',
      image: img.life,
      path: '/faculties/tourism',
    },
    {
      id: 'ai',
      categoryKey: 'home.study.categoryFaculty',
      titleKey: 'home.study.fci.title',
      descriptionKey: 'home.study.fci.desc',
      image: img.faculty,
      path: '/faculties/fci',
    },
    {
      id: 'sci',
      categoryKey: 'home.study.categoryFaculty',
      titleKey: 'home.study.sci.title',
      descriptionKey: 'home.study.sci.desc',
      image: img.college3,
      path: '/faculties/sci',
    },
  ];

  studyCards: FeatureCard[] = [];

  private readonly researchItemSeeds = [
    {
      id: 'r1',
      areaKey: 'home.research.r1.area',
      titleKey: 'home.research.r1.title',
      summaryKey: 'home.research.r1.summary',
      image: img.lab,
      featured: true as const,
    },
    {
      id: 'r2',
      areaKey: 'home.research.r2.area',
      titleKey: 'home.research.r2.title',
      summaryKey: 'home.research.r2.summary',
      image: img.online,
    },
    {
      id: 'r3',
      areaKey: 'home.research.r3.area',
      titleKey: 'home.research.r3.title',
      summaryKey: 'home.research.r3.summary',
      image: img.life,
    },
    {
      id: 'r4',
      areaKey: 'home.research.r4.area',
      titleKey: 'home.research.r4.title',
      summaryKey: 'home.research.r4.summary',
      image: img.library,
    },
  ];

  researchItems: ResearchItem[] = [];

  private readonly newsSeeds = [
    {
      id: 'n1',
      categoryAr: 'فعاليات',
      categoryEn: 'Events',
      date: '2026',
      titleAr: 'رئيس الجامعة ومحافظ البحر الأحمر يشهدان ندوة بمهرجان سينما الشباب',
      titleEn: 'University president and Red Sea governor attend Youth Film Festival seminar',
      descriptionAr: 'ندوة «من الحكاية إلى الأثر» بحضور قيادات المحافظة وممثلي وزارات التضامن والثقافة والشباب.',
      descriptionEn:
        '“From Story to Impact” seminar with governorate leaders and representatives of Social Solidarity, Culture, and Youth ministries.',
      image: img.news1,
      featured: true as const,
    },
    {
      id: 'n2',
      categoryAr: 'أكاديمي',
      categoryEn: 'Academic',
      date: '2026',
      titleAr: 'جامعة الغردقة تستكمل استعداداتها لانطلاق الدراسة بكلية العلوم',
      titleEn: 'Hurghada University completes preparations to launch studies at the Faculty of Science',
      descriptionAr: 'متابعة انتظام تقديم ملفات الطلاب الجدد بكلية العلوم ضمن خطط التوسع الأكاديمي.',
      descriptionEn: 'Follow-up on new-student file submissions at the Faculty of Science as part of academic expansion plans.',
      image: img.news2,
    },
    {
      id: 'n3',
      categoryAr: 'سياحة',
      categoryEn: 'Tourism',
      date: '2026',
      titleAr: 'كلية السياحة والفنادق تطبق برنامج فاتيل لإدارة الضيافة الدولية',
      titleEn: 'Faculty of Tourism & Hotels adopts the Vatel international hospitality management program',
      descriptionAr: 'خطوة نحو العالمية عبر برنامج تدريبي فرنسي متخصص في الضيافة.',
      descriptionEn: 'A step toward global standards through a specialized French hospitality training program.',
      image: img.news3,
    },
    {
      id: 'n4',
      categoryAr: 'خريجون',
      categoryEn: 'Alumni',
      date: '2026',
      titleAr: 'الجامعة تحتفي بخريجي الماجستير المهني بحضور محافظ البحر الأحمر',
      titleEn: 'University celebrates professional master’s graduates with the Red Sea governor',
      descriptionAr: 'حفل تخرج دفعة برنامج الماجستير المهني في إدارة الأعمال والمحاسبة.',
      descriptionEn: 'Graduation ceremony for the professional MBA and accounting master’s cohort.',
      image: img.news4,
    },
  ];

  news: NewsArticle[] = [];

  private readonly eventSeeds = [
    {
      id: 'e1',
      day: '10',
      monthAr: 'أبر',
      monthEn: 'Apr',
      titleAr: 'يوم تعريفي لطلاب كلية العلوم الجدد',
      titleEn: 'Orientation day for new Faculty of Science students',
      locationAr: 'كلية العلوم — الحرم الجامعي',
      locationEn: 'Faculty of Science — campus',
      categoryAr: 'طلاب',
      categoryEn: 'Students',
    },
    {
      id: 'e2',
      day: '18',
      monthAr: 'أبر',
      monthEn: 'Apr',
      titleAr: 'ورشة التطوير المهني للخريجين',
      titleEn: 'Professional development workshop for graduates',
      locationAr: 'مركز التطوير المهني بالغردقة',
      locationEn: 'Hurghada Professional Development Centre',
      categoryAr: 'تدريب',
      categoryEn: 'Training',
    },
    {
      id: 'e3',
      day: '02',
      monthAr: 'ماي',
      monthEn: 'May',
      titleAr: 'ملتقى السياحة والضيافة بالبحر الأحمر',
      titleEn: 'Red Sea tourism & hospitality forum',
      locationAr: 'كلية السياحة والفنادق',
      locationEn: 'Faculty of Tourism & Hotels',
      categoryAr: 'مؤتمر',
      categoryEn: 'Conference',
    },
    {
      id: 'e4',
      day: '15',
      monthAr: 'ماي',
      monthEn: 'May',
      titleAr: 'يوم مفتوح للحاسبات والذكاء الاصطناعي',
      titleEn: 'Open day for Computers & Artificial Intelligence',
      locationAr: 'كلية الحاسبات والذكاء الاصطناعي',
      locationEn: 'Faculty of Computers & AI',
      categoryAr: 'أكاديمي',
      categoryEn: 'Academic',
    },
  ];

  events: UniversityEvent[] = [];

  private readonly facultySeeds = [
    {
      id: 'edu',
      nameAr: 'كلية التربية',
      nameEn: 'Faculty of Education',
      descriptionAr: 'أقدم كليات الموقع — بدأت كفرع من تربية قنا عام 1995 واستقلت لاحقًا ضمن مسار إنشاء الجامعة.',
      descriptionEn:
        'The site’s oldest faculty — began as a Qena Education branch in 1995 and later became independent on the path to founding the university.',
      image: img.study,
    },
    {
      id: 'tourism',
      nameAr: 'كلية السياحة والفنادق',
      nameEn: 'Faculty of Tourism & Hotels',
      descriptionAr: 'برامج سياحة وضيافة مرتبطة بسوق العمل في الغردقة والبحر الأحمر، مع شراكات دولية.',
      descriptionEn: 'Tourism and hospitality programs linked to Hurghada and Red Sea labour markets, with international partnerships.',
      image: img.life,
    },
    {
      id: 'alsun',
      nameAr: 'كلية الألسن',
      nameEn: 'Faculty of Al-Alsun',
      descriptionAr: 'برامج لغات وترجمة تؤهل الطلاب للعمل في السياحة والدبلوماسية وسوق الخدمات.',
      descriptionEn: 'Language and translation programs preparing students for tourism, diplomacy, and service markets.',
      image: img.college1,
    },
    {
      id: 'fci',
      nameAr: 'كلية الحاسبات والذكاء الاصطناعي',
      nameEn: 'Faculty of Computers & Artificial Intelligence',
      descriptionAr: 'تخصصات حوسبة وذكاء اصطناعي وتقنيات معلومات حديثة.',
      descriptionEn: 'Computing, artificial intelligence, and modern information technology disciplines.',
      image: img.faculty,
    },
    {
      id: 'sci',
      nameAr: 'كلية العلوم',
      nameEn: 'Faculty of Science',
      descriptionAr: 'كلية جديدة ضمن تنسيق القبول لدعم التخصصات العلمية والتطبيقية.',
      descriptionEn: 'A new faculty within admissions coordination supporting scientific and applied disciplines.',
      image: img.lab,
    },
    {
      id: 'eng',
      nameAr: 'كلية الهندسة والطاقة',
      nameEn: 'Faculty of Engineering & Energy',
      descriptionAr: 'ضمن الهيكل الرسمي للجامعة — برامج هندسة وطاقة مرتبطة بتنمية الإقليم.',
      descriptionEn: 'Within the official university structure — engineering and energy programs tied to regional development.',
      image: img.college2,
    },
    {
      id: 'marine',
      nameAr: 'كلية علوم البحار والمصايد',
      nameEn: 'Faculty of Marine Sciences & Fisheries',
      descriptionAr: 'ضمن الهيكل الرسمي — علوم بحرية ومصايد تخدم البحر الأحمر.',
      descriptionEn: 'Within the official structure — marine sciences and fisheries serving the Red Sea.',
      image: img.globe,
    },
  ];

  faculties: Faculty[] = [];

  get colleges(): Faculty[] {
    return this.faculties;
  }

  statistics: Statistic[] = [];

  private readonly leaderSeed = {
    name: 'أ.د. محفوظ عبدالستار أبو الفضل إبراهيم',
    roleAr: 'رئيس جامعة الغردقة',
    roleEn: 'President of Hurghada University',
  };

  leaders: Leader[] = [];

  readonly importantLinks: NavLink[] = [
    { labelKey: 'common.portal', path: '/portal' },
    { labelKey: 'common.officialSite', path: '/' },
    { labelKey: 'common.faculties', path: '/faculties' },
    { labelKey: 'common.news', path: '/news' },
    { labelKey: 'common.about', path: '/about' },
    { labelKey: 'common.community', path: '/community' },
    { labelKey: 'common.staff', path: '/staff' },
    { labelKey: 'common.eservices', path: '/e-services' },
    { labelKey: 'common.pdCentre', path: '/community/units' },
    { labelKey: 'common.agenda', path: '/agenda' },
    { labelKey: 'common.contact', path: '/contact' },
  ];

  readonly courses: CourseSummary[] = [
    { id: 'c1', title: 'بكالوريوس التربية', level: 'جامعي', faculty: 'التربية', keywords: ['تربية', 'معلمين'] },
    { id: 'c2', title: 'بكالوريوس السياحة والفنادق', level: 'جامعي', faculty: 'السياحة', keywords: ['سياحة', 'ضيافة'] },
    { id: 'c3', title: 'بكالوريوس الألسن', level: 'جامعي', faculty: 'الألسن', keywords: ['لغات', 'ترجمة'] },
    { id: 'c4', title: 'بكالوريوس الحاسبات والذكاء الاصطناعي', level: 'جامعي', faculty: 'الحاسبات', keywords: ['ذكاء اصطناعي', 'حاسبات'] },
    { id: 'c5', title: 'بكالوريوس العلوم', level: 'جامعي', faculty: 'العلوم', keywords: ['علوم'] },
    { id: 'c6', title: 'ماجستير مهني في إدارة الأعمال', level: 'دراسات عليا', faculty: 'الدراسات العليا', keywords: ['ماجستير', 'إدارة'] },
  ];

  readonly sections: Record<string, SectionContent> = {
    academic: {
      id: 'academic',
      eyebrow: 'الشئون الأكاديمية',
      title: 'الشئون الأكاديمية',
      intro: 'برامج جامعية ودراسات عليا وخدمات أكاديمية وجودة واعتماد بجامعة الغردقة.',
      body: [
        'تدير الشئون الأكاديمية البرامج الدراسية ومتابعة الجداول والامتحانات والدعم الأكاديمي للطلاب في جميع الكليات.',
        'تهدف الجامعة إلى ربط التخصصات بسوق العمل في السياحة والتقنية والتعليم وتنمية البحر الأحمر.',
      ],
      links: this.mainNav[2].children,
      highlights: [
        { title: 'برامج مرتبطة بسوق العمل', text: 'تخصصات تخدم السياحة والتقنية والتعليم في البحر الأحمر.' },
        { title: 'التوسع الأكاديمي', text: 'افتتاح كلية العلوم ضمن خطط تطوير الجامعة.' },
      ],
    },
    'academic/programs': {
      id: 'academic/programs',
      eyebrow: 'الشئون الأكاديمية',
      title: 'البرامج الجامعية',
      intro: 'برامج بكالوريوس في كليات التربية والسياحة والألسن والحاسبات والعلوم.',
      body: [
        'تختار التخصص وفق ميولك ومتطلبات سوق العمل، مع متابعة أكاديمية داخل الكلية المعنية.',
        'تشمل المسارات برامج تربوية، ضيافة وسياحة، لغات وترجمة، حوسبة وذكاء اصطناعي، وعلوم أساسية وتطبيقية.',
      ],
      links: this.mainNav[2].children,
      highlights: [
        { title: 'كيفية الالتحاق', text: 'عبر تنسيق القبول الجامعي والبوابات الإلكترونية المعتمدة.' },
        { title: 'استفسار', text: 'للاستفسار عن البرامج تواصل عبر صفحة اتصل بنا أو الخدمات الإلكترونية.' },
      ],
    },
    'academic/graduate': {
      id: 'academic/graduate',
      eyebrow: 'الشئون الأكاديمية',
      title: 'الدراسات العليا',
      intro: 'برامج مهنية ودراسات عليا تدعم التطوير المهني لخريجي الجامعة والعاملين بالمحافظة.',
      body: [
        'تشمل البرامج الحالية مسارات مثل الماجستير المهني في إدارة الأعمال والمحاسبة.',
        'تُعلن مواعيد التقديم والقبول عبر أخبار الجامعة والخدمات الإلكترونية.',
      ],
      links: this.mainNav[2].children,
    },
    'academic/services': {
      id: 'academic/services',
      eyebrow: 'الشئون الأكاديمية',
      title: 'الخدمات الأكاديمية',
      intro: 'خدمات التسجيل والجداول والنتائج والدعم الأكاديمي داخل الحرم الجامعي.',
      body: [
        'يمكن للطلاب متابعة الخدمات الأكاديمية عبر القنوات الرسمية للكليات والخدمات الإلكترونية.',
        'تشمل الخدمات إرشادات التسجيل، التحويل بين البرامج عند الإتاحة، ودعم ذوي الهمم.',
      ],
      links: this.mainNav[2].children,
    },
    'academic/quality': {
      id: 'academic/quality',
      eyebrow: 'الشئون الأكاديمية',
      title: 'الجودة والاعتماد',
      intro: 'وحدة الجودة تعمل على تطوير البرامج الأكاديمية ومعايير الأداء المؤسسي.',
      body: [
        'تتابع الجامعة معايير الجودة في التدريس والتقويم وخدمة الطلاب بما يتوافق مع توجهات التعليم العالي.',
        'تُراجع البرامج دوريًا لضمان ملاءمتها لسوق العمل وهوية جامعة الغردقة.',
      ],
      links: this.mainNav[2].children,
    },
    research: {
      id: 'research',
      eyebrow: 'البحث العلمي',
      title: 'البحث العلمي',
      intro: 'دعم البحث التطبيقي والمشروعات المرتبطة بتنمية المحافظة والتحول الرقمي.',
      body: [
        'تركّز الجامعة على بحوث تخدم بيئة البحر الأحمر، السياحة المستدامة، التعليم، والذكاء الاصطناعي.',
      ],
      links: this.mainNav[3].children,
      highlights: [
        { title: 'أولوية بحثية', text: 'التنمية السياحية والبيئية بالمحافظة.' },
        { title: 'شراكات', text: 'تعاون مع جهات محلية ودولية حسب طبيعة المشروع.' },
      ],
    },
    'research/centres': {
      id: 'research/centres',
      eyebrow: 'البحث العلمي',
      title: 'المراكز البحثية',
      intro: 'مراكز ووحدات تدعم البحث التطبيقي وخدمة المجتمع في جامعة الغردقة.',
      body: [
        'تعمل المراكز على ربط الباحثين بالمجتمع المحلي وقضايا التنمية في البحر الأحمر.',
        'للاستفسار عن الأنشطة البحثية تواصل مع قطاع البحث العلمي عبر قنوات الجامعة.',
      ],
      links: this.mainNav[3].children,
    },
    'research/projects': {
      id: 'research/projects',
      eyebrow: 'البحث العلمي',
      title: 'المشروعات البحثية',
      intro: 'مشروعات تطبيقية في البيئة والسياحة والتعليم والتقنية.',
      body: [
        'تشجع الجامعة أعضاء هيئة التدريس والباحثين على تقديم مشروعات تخدم المحافظة وسوق العمل.',
        'تُعرض أبرز المبادرات عبر صفحة الأخبار والبحث العلمي.',
      ],
      links: this.mainNav[3].children,
    },
    'research/libraries': {
      id: 'research/libraries',
      eyebrow: 'البحث العلمي',
      title: 'المكتبات',
      intro: 'خدمات مكتبية ومصادر معرفية لدعم الطلاب والباحثين.',
      body: [
        'توفر مكتبات الجامعة مصادر ورقية ورقمية تخدم المقررات والبحث العلمي.',
        'يُعلن عن مواعيد العمل والخدمات عبر الكليات والخدمات الإلكترونية.',
      ],
      links: this.mainNav[3].children,
    },
    'research/awards': {
      id: 'research/awards',
      eyebrow: 'البحث العلمي',
      title: 'جوائز البحث',
      intro: 'تكريم الإنجازات البحثية والمبادرات المتميزة داخل الجامعة.',
      body: [
        'تُعلن الجوائز والفرص التنافسية عبر المكتب الإعلامي وقطاع البحث العلمي.',
      ],
      links: this.mainNav[3].children,
    },
    community: {
      id: 'community',
      eyebrow: 'الوحدات والمراكز',
      title: 'الوحدات والمراكز وخدمة المجتمع',
      intro: 'مركز التطوير المهني وقطاع خدمة المجتمع وتنمية البيئة.',
      body: [
        'ترتبط جامعة الغردقة بالمجتمع المحلي عبر برامج التدريب والتوعية والتنمية البيئية.',
      ],
      links: this.mainNav[5].children,
    },
    'community/units': {
      id: 'community/units',
      eyebrow: 'الوحدات والمراكز',
      title: 'مركز التطوير المهني بالغردقة',
      intro: 'مركز يدعم مهارات الخريجين والتوظيف والتدريب المهني في البحر الأحمر.',
      body: [
        'يقدم المركز ورشًا وبرامج تطوير مهني بالتعاون مع الكليات وجهات العمل المحلية.',
        'تابع الأجندة وأخبار الجامعة لمواعيد الورش والملتقيات.',
      ],
      links: this.mainNav[5].children,
      highlights: [
        { title: 'للخريجين', text: 'برامج جاهزية سوق العمل والسيرة المهنية.' },
        { title: 'للطلاب', text: 'تدريب ومهارات عملية مرتبطة بالتخصص.' },
      ],
    },
    'community/guide': {
      id: 'community/guide',
      eyebrow: 'الوحدات والمراكز',
      title: 'دليل الخدمات',
      intro: 'دليل موجز لخدمات المجتمع والوحدات داخل الجامعة.',
      body: [
        'يشمل الدليل قنوات التواصل مع الوحدات والمراكز وقطاع خدمة المجتمع.',
        'للاستفسارات العامة استخدم صفحة اتصل بنا أو الخدمات الإلكترونية.',
      ],
      links: this.mainNav[5].children,
    },
    students: {
      id: 'students',
      eyebrow: 'الطلاب',
      title: 'شئون الطلاب',
      intro: 'خدمات وأنشطة ورعاية ومنح لدعم الطلاب داخل جامعة الغردقة.',
      body: [
        'تهدف شئون الطلاب إلى توفير بيئة داعمة أكاديميًا واجتماعيًا وصحيًا طوال سنوات الدراسة.',
      ],
      links: this.mainNav[4].children,
    },
    'students/services': {
      id: 'students/services',
      eyebrow: 'الطلاب',
      title: 'خدمات الطلاب',
      intro: 'خدمات يومية وإدارية تدعم مسيرتك الدراسية في الحرم الجامعي.',
      body: [
        'تشمل الخدمات الاستعلامات الطلابية، الدعم الإداري، والتوجيه داخل الكليات.',
        'يمكن متابعة جزء من الخدمات عبر البوابات الإلكترونية عند إتاحتها.',
      ],
      links: this.mainNav[4].children,
    },
    'students/activities': {
      id: 'students/activities',
      eyebrow: 'الطلاب',
      title: 'الأنشطة الطلابية',
      intro: 'أنشطة ثقافية ورياضية واجتماعية تثري الحياة الجامعية.',
      body: [
        'تشجع الجامعة المشاركة في الأسر والأنشطة والفعاليات الطلابية على مدار العام.',
        'تُعلن المواعيد عبر الأجندة وأخبار الجامعة.',
      ],
      links: this.mainNav[4].children,
    },
    'students/health': {
      id: 'students/health',
      eyebrow: 'الطلاب',
      title: 'الرعاية الصحية',
      intro: 'خدمات رعاية صحية أولية ودعم لطلاب الجامعة.',
      body: [
        'توفر الجامعة قنوات للرعاية الصحية والإرشاد وفق الإمكانات المتاحة داخل الحرم.',
        'في الحالات الطارئة تُتبع التعليمات المعلنة من إدارة الجامعة.',
      ],
      links: this.mainNav[4].children,
    },
    'students/scholarships': {
      id: 'students/scholarships',
      eyebrow: 'الطلاب',
      title: 'المنح',
      intro: 'فرص دعم ومنح للطلاب وفق الضوابط المعلنة.',
      body: [
        'تُعلن شروط المنح ومواعيد التقديم عبر الشئون الأكاديمية وأخبار الجامعة.',
        'يُنصح بمتابعة الصفحات الرسمية وعدم الاعتماد على مصادر غير معتمدة.',
      ],
      links: this.mainNav[4].children,
    },
    staff: {
      id: 'staff',
      eyebrow: 'قطاعات الجامعة',
      title: 'قطاعات الجامعة وأعضاء هيئة التدريس',
      intro: 'خدمات أعضاء هيئة التدريس والتربية العسكرية وقطاعات الجامعة.',
      body: [
        'تضم القطاعات الإدارية والأكاديمية منظومة العمل اليومي للجامعة ودعم العملية التعليمية.',
      ],
      links: this.mainNav[6].children,
    },
    'staff/services': {
      id: 'staff/services',
      eyebrow: 'قطاعات الجامعة',
      title: 'خدمات وتسهيلات أعضاء هيئة التدريس',
      intro: 'خدمات إدارية وتقنية وتسهيلات لدعم أعضاء هيئة التدريس.',
      body: [
        'تشمل الخدمات الإجراءات الإدارية والدعم الفني والتسهيلات المعلنة داخل القطاعات.',
        'للاستفسار استخدم البريد الجامعي أو صفحة اتصل بنا.',
      ],
      links: this.mainNav[6].children,
    },
    'staff/military': {
      id: 'staff/military',
      eyebrow: 'قطاعات الجامعة',
      title: 'التربية العسكرية',
      intro: 'متطلبات وإجراءات التربية العسكرية لطلاب الجامعة وفق اللوائح المعتمدة.',
      body: [
        'تُعلن مواعيد التسجيل والاستيفاء عبر شئون الطلاب والكليات المعنية.',
        'يُرجى متابعة الإعلانات الرسمية وعدم الاعتماد على مصادر غير معتمدة.',
      ],
      links: this.mainNav[6].children,
    },
    visitors: {
      id: 'visitors',
      eyebrow: 'الزائرون',
      title: 'خدمات للزائرين',
      intro: 'معلومات عن الحرم الجامعي في شمال الغردقة وسبل التواصل.',
      body: [
        'يقع الحرم على مساحة نحو 500 فدان شمال مدينة الغردقة بمحافظة البحر الأحمر.',
        'للزيارات الرسمية والشراكات يُفضل التنسيق مسبقًا عبر صفحة اتصل بنا.',
      ],
      links: [
        { labelKey: 'common.about', path: '/about' },
        { labelKey: 'common.contact', path: '/contact' },
        { labelKey: 'common.faculties', path: '/faculties' },
        { labelKey: 'common.news', path: '/news' },
      ],
    },
    about: {
      id: 'about',
      eyebrow: 'عن الجامعة',
      title: 'عن جامعة الغردقة',
      intro:
        'بدأت الدراسة بفرع الغردقة بكلية التربية عام 1995، ثم خُصصت 500 فدان للحرم، وصدر قرار إنشاء جامعة الغردقة رقم 3005 لسنة 2024.',
      body: [
        'جامعة الغردقة جامعة حكومية مصرية تخدم التعليم العالي في البحر الأحمر وربطه بالتنمية المحلية.',
      ],
      links: this.mainNav[7].children,
      highlights: [
        { title: 'الرؤية', text: 'التميز في التعليم والبحث وخدمة المجتمع بما يلائم هوية البحر الأحمر.' },
        { title: 'الرسالة', text: 'إعداد الطلاب أكاديميًا ومهنيًا وثقافيًا عبر برامج حديثة مرتبطة بسوق العمل.' },
      ],
    },
    'about/history': {
      id: 'about/history',
      eyebrow: 'عن الجامعة',
      title: 'نشأة الجامعة',
      intro: 'من فرع كلية التربية بالغردقة عام 1995 إلى جامعة مستقلة بقرار 3005 لسنة 2024.',
      body: [
        'بدأت الدراسة بكلية التربية بفرع الغردقة عام 1995 كامتداد لجامعة جنوب الوادي / قنا، ثم تطورت المنظومة الأكاديمية بالموقع.',
        'خُصصت أرض للحرم الجامعي شمال المدينة بمساحة تقارب 500 فدان، وصدر قرار إنشاء جامعة الغردقة رقم 3005 لسنة 2024.',
        'تسعى الجامعة للتوسع في الكليات والبرامج بما يخدم محافظة البحر الأحمر.',
      ],
      links: this.mainNav[7].children,
    },
    'about/facts': {
      id: 'about/facts',
      eyebrow: 'عن الجامعة',
      title: 'الرؤية والرسالة',
      intro: 'إطار موجّه لعمل الجامعة في التعليم والبحث وخدمة المجتمع.',
      body: [
        'الرؤية: التميز الأكاديمي وخدمة مجتمع البحر الأحمر ومصر.',
        'الرسالة: تقديم برامج تعليمية وبحثية ومهنية مرتبطة بسوق العمل والتنمية المستدامة.',
      ],
      links: this.mainNav[7].children,
      highlights: [
        { title: 'القيم', text: 'الجودة، النزاهة، خدمة المجتمع، والابتكار.' },
      ],
    },
    'about/leadership': {
      id: 'about/leadership',
      eyebrow: 'عن الجامعة',
      title: 'قيادات الجامعة',
      intro: 'القيادة الأكاديمية والإدارية لجامعة الغردقة.',
      body: [
        'يتولى رئاسة الجامعة أ.د. محفوظ عبدالستار أبو الفضل إبراهيم.',
        'تُعلن التعيينات والتحديثات الرسمية عبر الموقع والأخبار الجامعية.',
      ],
      links: this.mainNav[7].children,
    },
    'about/landmarks': {
      id: 'about/landmarks',
      eyebrow: 'عن الجامعة',
      title: 'معالم الحرم الجامعي',
      intro: 'حرم جامعي شمال الغردقة على مساحة واسعة تخدم التوسع الأكاديمي.',
      body: [
        'يشمل الحرم مباني الكليات والخدمات الطلابية ومساحات للتوسع المستقبلي.',
        'تُعرض صور الحرم والحياة الجامعية عبر صفحات الموقع الرئيسية.',
      ],
      links: this.mainNav[7].children,
    },
    'about/policies': {
      id: 'about/policies',
      eyebrow: 'عن الجامعة',
      title: 'السياسات والخصوصية',
      intro: 'إطار عام لاستخدام الموقع وحماية البيانات والالتزامات القانونية.',
      body: [
        'يُستخدم الموقع لأغراض إعلامية وتعريفية بجامعة الغردقة وخدماتها.',
        'يُراعى عدم مشاركة بيانات حساسة عبر قنوات غير رسمية، والاعتماد على البوابات المعتمدة للخدمات الإلكترونية.',
        'للاستفسارات القانونية والإعلامية استخدم صفحة اتصل بنا.',
      ],
      links: this.mainNav[7].children,
    },
    'about/privacy': {
      id: 'about/privacy',
      eyebrow: 'عن الجامعة',
      title: 'سياسة الخصوصية',
      intro: 'كيف تتعامل جامعة الغردقة مع المعلومات عند استخدام الموقع والخدمات الإلكترونية.',
      body: [
        'قد تُجمع بيانات محدودة عند التواصل معنا أو استخدام البوابات الرسمية لغرض الرد وتقديم الخدمة.',
        'لا نبيع البيانات الشخصية لأطراف ثالثة، ويُقيَّد الوصول للمعلومات للأغراض الإدارية المعتمدة.',
      ],
      links: [
        { labelKey: 'footer.legal.terms', path: '/about/terms' },
        { labelKey: 'common.contact', path: '/contact' },
        { labelKey: 'common.about', path: '/about' },
      ],
    },
    'about/terms': {
      id: 'about/terms',
      eyebrow: 'عن الجامعة',
      title: 'شروط الاستخدام',
      intro: 'شروط عامة لاستخدام موقع جامعة الغردقة ومحتواه.',
      body: [
        'المحتوى الإعلامي لأغراض تعريفية وقد يُحدَّث دون إشعار مسبق.',
        'يُمنع إعادة نشر المحتوى الرسمي بطريقة مضللة أو منسوبة لغير الجامعة.',
      ],
      links: [
        { labelKey: 'footer.legal.privacy', path: '/about/privacy' },
        { labelKey: 'common.contact', path: '/contact' },
        { labelKey: 'common.about', path: '/about' },
      ],
    },
    'e-services': {
      id: 'e-services',
      eyebrow: 'خدمات',
      title: 'الخدمات الإلكترونية',
      intro: 'بوابات وخدمات إلكترونية للطلاب وأعضاء هيئة التدريس والاستفسارات.',
      body: [
        'تشمل الخدمات الإلكترونية البريد الجامعي وبوابات الاستعلام والتقديم عند إتاحتها رسميًا.',
        'للاستفسار عن تفعيل الحسابات والخدمات تواصل مع الدعم عبر صفحة اتصل بنا.',
      ],
      links: [
        { labelKey: 'common.portal', path: '/portal' },
        { labelKey: 'common.faculties', path: '/faculties' },
        { labelKey: 'nav.students.services', path: '/students/services' },
        { labelKey: 'common.contact', path: '/contact' },
      ],
      highlights: [
        { title: 'ملاحظة', text: 'قد تختلف البوابات المتاحة حسب الفصل الدراسي والتحديثات الرسمية.' },
      ],
    },
    ai: {
      id: 'ai',
      eyebrow: 'الذكاء الاصطناعي',
      title: 'الحاسبات والذكاء الاصطناعي',
      intro: 'كلية الحاسبات والذكاء الاصطناعي بجامعة الغردقة وبرامجها الحديثة.',
      body: [
        'تركّز الكلية على إعداد كوادر في الحوسبة والذكاء الاصطناعي وتقنيات المعلومات.',
        'اطلع على صفحة الكلية لمزيد من التفاصيل.',
      ],
      links: [
        { labelKey: 'common.facultyPage', path: '/faculties/fci' },
        { labelKey: 'common.faculties', path: '/faculties' },
        { labelKey: 'nav.research', path: '/research' },
        { labelKey: 'nav.academic.programs', path: '/academic/programs' },
      ],
    },
    national: {
      id: 'national',
      eyebrow: 'شراكات',
      title: 'شراكات أكاديمية',
      intro: 'تعاون مع جامعات وجهات محلية لدعم البرامج المهنية والتدريب.',
      body: [
        'تبنى الجامعة شراكات تدعم التدريب والتوظيف والبحث التطبيقي داخل مصر.',
      ],
      links: [
        { labelKey: 'common.news', path: '/news' },
        { labelKey: 'nav.community.service', path: '/community' },
        { labelKey: 'common.contact', path: '/contact' },
      ],
    },
    international: {
      id: 'international',
      eyebrow: 'دولي',
      title: 'التعاون الدولي',
      intro: 'شراكات دولية مثل برامج الضيافة الدولية لكلية السياحة والفنادق.',
      body: [
        'من أبرز المبادرات تطبيق برامج تدريبية دولية في إدارة الضيافة بالتعاون مع شركاء متخصصين.',
      ],
      links: [
        { labelKey: 'nav.faculties.tourism', path: '/faculties/tourism' },
        { labelKey: 'common.news', path: '/news' },
        { labelKey: 'common.about', path: '/about' },
      ],
    },
  };

  heroImage = img.hero;
  globalImage = img.life;
  readonly contactImage = img.campus;
  readonly eventsImage = img.students;
  readonly linksImage = img.online;
  readonly admissionsImage = img.graduate;
  readonly newsBannerImage = img.news1;
  readonly facultiesBannerImage = img.studyAlt;
  readonly researchBannerImage = img.lab;
  readonly aboutBannerImage = img.campus;

  getFeaturedNews(): NewsArticle {
    return this.news.find((n) => n.featured) ?? this.news[0];
  }

  getSecondaryNews(): NewsArticle[] {
    return this.news.filter((n) => !n.featured).slice(0, 3);
  }

  getFeaturedResearch(): ResearchItem {
    return this.researchItems.find((r) => r.featured) ?? this.researchItems[0];
  }

  getFaculty(id: string): Faculty | undefined {
    return this.faculties.find((f) => f.id === id);
  }

  getNewsArticle(id: string): NewsArticle | undefined {
    return this.news.find((n) => n.id === id);
  }

  getSection(id: string): SectionContent | undefined {
    const normalized = id.replace(/^\//, '');
    const parent = normalized.split('/')[0];
    const raw = this.sections[normalized] ?? this.sections[parent];
    if (!raw) return undefined;

    const defaults: Record<string, string> = {
      academic: img.studyAlt,
      research: img.lab,
      students: img.students,
      community: img.life,
      staff: img.faculty,
      visitors: img.globe,
      about: img.campus,
      'e-services': img.online,
      ai: img.faculty,
      national: img.continuing,
      international: img.globe,
      'academic/graduate': img.graduate,
      'academic/programs': img.studyAlt,
      'research/libraries': img.library,
      'students/activities': img.students,
      'community/units': img.continuing,
      'about/history': img.campusAlt,
      'about/landmarks': img.campus,
    };

    return {
      ...raw,
      image: raw.image ?? defaults[normalized] ?? defaults[parent] ?? img.campus,
    };
  }

  search(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const fromNews = this.news
      .filter((n) => n.title.includes(query) || n.description.includes(query) || n.category.includes(query))
      .map((n) => ({
        id: `news-${n.id}`,
        title: n.title,
        type: 'خبر',
        path: `/news/${n.id}`,
        blurb: n.description,
      }));

    const fromFac = this.faculties
      .filter((f) => f.name.includes(query) || f.description.includes(query))
      .map((f) => ({
        id: `fac-${f.id}`,
        title: f.name,
        type: 'كلية',
        path: `/faculties/${f.id}`,
        blurb: f.description,
      }));

    const fromCourses = this.courses
      .filter(
        (c) =>
          c.title.includes(query) ||
          c.faculty.includes(query) ||
          c.keywords.some((k) => k.toLowerCase().includes(q) || k.includes(query)),
      )
      .map((c) => ({
        id: `course-${c.id}`,
        title: c.title,
        type: 'برنامج',
        path: '/academic/programs',
        blurb: `${c.level} · ${c.faculty}`,
      }));

    const fromEvents = this.events
      .filter((e) => e.title.includes(query) || e.category.includes(query))
      .map((e) => ({
        id: `event-${e.id}`,
        title: e.title,
        type: 'فعالية',
        path: '/agenda',
        blurb: `${e.category} — ${e.location}`,
      }));

    return [...fromFac, ...fromCourses, ...fromNews, ...fromEvents].slice(0, 12);
  }

  get suggestedSearches(): string[] {
    return this.locale.lang() === 'en'
      ? [
          'Faculty of Education',
          'Tourism & Hotels',
          'Artificial Intelligence',
          'Faculty of Science',
          'Professional Development Centre',
          'University news',
        ]
      : [
          'كلية التربية',
          'السياحة والفنادق',
          'الذكاء الاصطناعي',
          'كلية العلوم',
          'مركز التطوير المهني',
          'أخبار الجامعة',
        ];
  }

  /** Hydrate public site content from the shared Backend CMS/API (dashboard-managed). */
  async loadFromApi(): Promise<void> {
    try {
      const site = await firstValueFrom(
        this.http.get<ApiPublicSite>(`${environment.apiUrl}/api/public/site`)
      );
      this.siteSnapshot = site;
      this.applySiteSnapshot(site);
      this.rematerializeKeyBasedLists();
      this.apiReady = true;
    } catch {
      // Keep seeded bilingual fallback content when API is offline.
      this.apiReady = false;
      this.applySeedStatsAndLists();
      this.rematerializeKeyBasedLists();
    }
  }

  private rematerializeKeyBasedLists(): void {
    this.studyCards = this.studyCardSeeds.map((s) => ({
      id: s.id,
      category: this.locale.t(s.categoryKey),
      title: this.locale.t(s.titleKey),
      description: this.locale.t(s.descriptionKey),
      image: s.image,
      path: s.path,
    }));

    this.researchItems = this.researchItemSeeds.map((s) => ({
      id: s.id,
      area: this.locale.t(s.areaKey),
      title: this.locale.t(s.titleKey),
      summary: this.locale.t(s.summaryKey),
      image: s.image,
      featured: 'featured' in s ? s.featured : undefined,
    }));
  }

  private applySeedStatsAndLists(): void {
    this.brandName = this.localized('جامعة الغردقة', this.brandNameEn);
    this.tagline = this.localized(this.taglineAr, this.taglineEn);
    this.aboutIntro = this.localized(this.aboutIntroAr, this.aboutIntroEn);
    this.addressLines = this.locale.lang() === 'en' ? [...this.addressLinesEn] : [...this.addressLinesAr];

    this.faculties = this.facultySeeds.map((f) => ({
      id: f.id,
      name: this.localized(f.nameAr, f.nameEn),
      description: this.localized(f.descriptionAr, f.descriptionEn),
      image: f.image,
    }));

    this.news = this.newsSeeds.map((n) => ({
      id: n.id,
      category: this.localized(n.categoryAr, n.categoryEn),
      date: n.date,
      title: this.localized(n.titleAr, n.titleEn),
      description: this.localized(n.descriptionAr, n.descriptionEn),
      image: n.image,
      featured: 'featured' in n ? n.featured : undefined,
    }));

    this.events = this.eventSeeds.map((e) => ({
      id: e.id,
      day: e.day,
      month: this.localized(e.monthAr, e.monthEn),
      title: this.localized(e.titleAr, e.titleEn),
      location: this.localized(e.locationAr, e.locationEn),
      category: this.localized(e.categoryAr, e.categoryEn),
    }));

    this.leaders = [
      {
        name: this.leaderSeed.name,
        role: this.localized(this.leaderSeed.roleAr, this.leaderSeed.roleEn),
      },
    ];

    this.statistics = [
      { value: '2024', label: this.locale.t('statistics.founded') },
      { value: '500', label: this.locale.t('statistics.campusAcres') },
      { value: '5+', label: this.locale.t('statistics.facultiesOpen') },
      {
        value: this.locale.lang() === 'en' ? 'Red Sea' : 'البحر الأحمر',
        label: this.locale.t('statistics.location'),
      },
    ];
  }

  private applySiteSnapshot(site: ApiPublicSite): void {
    const p = site.profile;
    if (p) {
      this.brandName = this.localized(p.brandNameAr, p.brandNameEn) || this.brandName;
      this.brandNameEn = p.brandNameEn || this.brandNameEn;
      this.tagline = this.localized(p.tagline, p.taglineEn) || this.tagline;
      this.aboutIntro = this.localized(p.aboutIntro, p.aboutIntroEn) || this.aboutIntro;
      const addressRaw = this.localized(p.addressLines, p.addressLinesEn);
      this.addressLines = (addressRaw || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      this.phone = p.phone || this.phone;
      this.email = p.email || this.email;
      this.website = p.website || this.website;
      if (p.heroImageUrl) this.heroImage = this.resolveMediaUrl(p.heroImageUrl);
      if (p.globalImageUrl) this.globalImage = this.resolveMediaUrl(p.globalImageUrl);
      if (p.presidentName) {
        this.leaders = [
          {
            name: p.presidentName,
            role:
              this.localized(p.presidentTitle, p.presidentTitleEn) ||
              this.localized(this.leaderSeed.roleAr, this.leaderSeed.roleEn),
          },
        ];
      }
    }

    if (site.faculties?.length) {
      this.faculties = site.faculties.map((f) => ({
        id: f.slug || f.id,
        name: this.localized(f.arabicName, f.name) || f.arabicName || f.name,
        description: f.description || f.dean,
        image: this.resolveMediaUrl(f.imageUrl) || img.study,
      }));
    } else {
      this.faculties = this.facultySeeds.map((f) => ({
        id: f.id,
        name: this.localized(f.nameAr, f.nameEn),
        description: this.localized(f.descriptionAr, f.descriptionEn),
        image: f.image,
      }));
    }

    if (site.news?.length) {
      this.news = site.news.map((n) => ({
        id: n.id,
        category: this.localized(n.category, n.categoryEn) || n.category,
        date: n.publishedLabel,
        title: this.localized(n.title, n.titleEn) || n.title,
        description: this.localized(n.summary, n.summaryEn) || n.summary,
        image: this.resolveMediaUrl(n.imageUrl) || img.news1,
        featured: n.isFeatured,
      }));
    } else {
      this.news = this.newsSeeds.map((n) => ({
        id: n.id,
        category: this.localized(n.categoryAr, n.categoryEn),
        date: n.date,
        title: this.localized(n.titleAr, n.titleEn),
        description: this.localized(n.descriptionAr, n.descriptionEn),
        image: n.image,
        featured: 'featured' in n ? n.featured : undefined,
      }));
    }

    if (site.events?.length) {
      this.events = site.events.map((e) => ({
        id: e.id,
        day: e.day,
        month: this.localized(e.month, e.monthEn) || e.month,
        title: this.localized(e.title, e.titleEn) || e.title,
        location: this.localized(e.location, e.locationEn) || e.location,
        category: this.localized(e.category, e.categoryEn) || e.category,
      }));
    } else {
      this.events = this.eventSeeds.map((e) => ({
        id: e.id,
        day: e.day,
        month: this.localized(e.monthAr, e.monthEn),
        title: this.localized(e.titleAr, e.titleEn),
        location: this.localized(e.locationAr, e.locationEn),
        category: this.localized(e.categoryAr, e.categoryEn),
      }));
    }

    this.statistics = [
      {
        value: String(site.facultyCount || this.faculties.length),
        label: this.locale.t('statistics.faculties'),
      },
      {
        value: String(site.studentCount || '—'),
        label: this.locale.t('statistics.students'),
      },
      {
        value: String(site.staffCount || '—'),
        label: this.locale.t('statistics.staff'),
      },
      {
        value: String(site.courseCount || '—'),
        label: this.locale.t('statistics.courses'),
      },
    ];
  }
}
