'use strict';
window.PORTFOLIO_FIELDS = [
  {
    "key": "site.title",
    "section": "Profile",
    "label": "Browser tab title",
    "selector": "title",
    "kind": "text"
  },
  {
    "key": "site.description",
    "section": "Profile",
    "label": "Search engine description",
    "selector": "meta[name=\"description\"]",
    "kind": "meta"
  },
  {
    "key": "hero.name",
    "section": "Profile",
    "label": "Your name (use two lines if you like)",
    "selector": "#hero-title",
    "kind": "heading"
  },
  {
    "key": "hero.field",
    "section": "Profile",
    "label": "Research field",
    "selector": ".hero-identity .eyebrow",
    "kind": "own"
  },
  {
    "key": "hero.location",
    "section": "Profile",
    "label": "Location",
    "selector": ".hero-location",
    "kind": "text"
  },
  {
    "key": "hero.role",
    "section": "Profile",
    "label": "Role — text before the institution",
    "selector": ".hero-role",
    "kind": "own"
  },
  {
    "key": "hero.institution",
    "section": "Profile",
    "label": "Institution",
    "selector": ".hero-role strong",
    "kind": "text"
  },
  {
    "key": "hero.intro",
    "section": "Profile",
    "label": "Introductory paragraph",
    "selector": ".hero-intro",
    "kind": "text"
  },
  {
    "key": "hero.photo",
    "section": "Profile",
    "label": "Profile photo URL or uploaded image",
    "selector": ".hero-portrait",
    "kind": "photo"
  },
  {
    "key": "affiliation.1.name",
    "section": "Profile",
    "label": "Affiliation 1 name",
    "selector": ".affiliation-inner > a:nth-of-type(1)",
    "kind": "text"
  },
  {
    "key": "affiliation.1.url",
    "section": "Profile",
    "label": "Affiliation 1 website",
    "selector": ".affiliation-inner > a:nth-of-type(1)",
    "kind": "link"
  },
  {
    "key": "affiliation.2.name",
    "section": "Profile",
    "label": "Affiliation 2 name",
    "selector": ".affiliation-inner > a:nth-of-type(2)",
    "kind": "text"
  },
  {
    "key": "affiliation.2.url",
    "section": "Profile",
    "label": "Affiliation 2 website",
    "selector": ".affiliation-inner > a:nth-of-type(2)",
    "kind": "link"
  },
  {
    "key": "about.heading",
    "section": "About",
    "label": "About heading",
    "selector": "#about-title",
    "kind": "heading"
  },
  {
    "key": "about.paragraph1",
    "section": "About",
    "label": "About paragraph 1",
    "selector": ".about-copy > p:nth-of-type(1)",
    "kind": "long"
  },
  {
    "key": "about.paragraph2",
    "section": "About",
    "label": "About paragraph 2",
    "selector": ".about-copy > p:nth-of-type(2)",
    "kind": "long"
  },
  {
    "key": "research.heading",
    "section": "Research",
    "label": "Research heading",
    "selector": "#research-title",
    "kind": "heading"
  },
  {
    "key": "research.intro",
    "section": "Research",
    "label": "Research introduction",
    "selector": "#research .section-aside",
    "kind": "long"
  },
  {
    "key": "research.1.label",
    "section": "Research",
    "label": "Research area 1 — label",
    "selector": ".research-card:nth-child(1) .card-label",
    "kind": "text"
  },
  {
    "key": "research.1.title",
    "section": "Research",
    "label": "Research area 1 — title",
    "selector": ".research-card:nth-child(1) h3",
    "kind": "heading"
  },
  {
    "key": "research.1.description",
    "section": "Research",
    "label": "Research area 1 — description",
    "selector": ".research-card:nth-child(1) > p:not(.card-label)",
    "kind": "long"
  },
  {
    "key": "research.1.tag1",
    "section": "Research",
    "label": "Research area 1 — keyword 1",
    "selector": ".research-card:nth-child(1) .tag-list span:nth-child(1)",
    "kind": "text"
  },
  {
    "key": "research.1.tag2",
    "section": "Research",
    "label": "Research area 1 — keyword 2",
    "selector": ".research-card:nth-child(1) .tag-list span:nth-child(2)",
    "kind": "text"
  },
  {
    "key": "research.1.tag3",
    "section": "Research",
    "label": "Research area 1 — keyword 3",
    "selector": ".research-card:nth-child(1) .tag-list span:nth-child(3)",
    "kind": "text"
  },
  {
    "key": "research.2.label",
    "section": "Research",
    "label": "Research area 2 — label",
    "selector": ".research-card:nth-child(2) .card-label",
    "kind": "text"
  },
  {
    "key": "research.2.title",
    "section": "Research",
    "label": "Research area 2 — title",
    "selector": ".research-card:nth-child(2) h3",
    "kind": "heading"
  },
  {
    "key": "research.2.description",
    "section": "Research",
    "label": "Research area 2 — description",
    "selector": ".research-card:nth-child(2) > p:not(.card-label)",
    "kind": "long"
  },
  {
    "key": "research.2.tag1",
    "section": "Research",
    "label": "Research area 2 — keyword 1",
    "selector": ".research-card:nth-child(2) .tag-list span:nth-child(1)",
    "kind": "text"
  },
  {
    "key": "research.2.tag2",
    "section": "Research",
    "label": "Research area 2 — keyword 2",
    "selector": ".research-card:nth-child(2) .tag-list span:nth-child(2)",
    "kind": "text"
  },
  {
    "key": "research.2.tag3",
    "section": "Research",
    "label": "Research area 2 — keyword 3",
    "selector": ".research-card:nth-child(2) .tag-list span:nth-child(3)",
    "kind": "text"
  },
  {
    "key": "research.3.label",
    "section": "Research",
    "label": "Research area 3 — label",
    "selector": ".research-card:nth-child(3) .card-label",
    "kind": "text"
  },
  {
    "key": "research.3.title",
    "section": "Research",
    "label": "Research area 3 — title",
    "selector": ".research-card:nth-child(3) h3",
    "kind": "heading"
  },
  {
    "key": "research.3.description",
    "section": "Research",
    "label": "Research area 3 — description",
    "selector": ".research-card:nth-child(3) > p:not(.card-label)",
    "kind": "long"
  },
  {
    "key": "research.3.tag1",
    "section": "Research",
    "label": "Research area 3 — keyword 1",
    "selector": ".research-card:nth-child(3) .tag-list span:nth-child(1)",
    "kind": "text"
  },
  {
    "key": "research.3.tag2",
    "section": "Research",
    "label": "Research area 3 — keyword 2",
    "selector": ".research-card:nth-child(3) .tag-list span:nth-child(2)",
    "kind": "text"
  },
  {
    "key": "research.3.tag3",
    "section": "Research",
    "label": "Research area 3 — keyword 3",
    "selector": ".research-card:nth-child(3) .tag-list span:nth-child(3)",
    "kind": "text"
  },
  {
    "key": "methods.heading",
    "section": "Methods",
    "label": "Methods heading",
    "selector": "#methods-title",
    "kind": "heading"
  },
  {
    "key": "methods.intro",
    "section": "Methods",
    "label": "Methods introduction",
    "selector": ".methods-heading > p:not(.eyebrow)",
    "kind": "long"
  },
  {
    "key": "methods.1.title",
    "section": "Methods",
    "label": "Method group 1 — title",
    "selector": ".method-list > div:nth-child(1) h3",
    "kind": "text"
  },
  {
    "key": "methods.1.list",
    "section": "Methods",
    "label": "Method group 1 — one technique per line",
    "selector": ".method-list > div:nth-child(1) ul",
    "kind": "list"
  },
  {
    "key": "methods.2.title",
    "section": "Methods",
    "label": "Method group 2 — title",
    "selector": ".method-list > div:nth-child(2) h3",
    "kind": "text"
  },
  {
    "key": "methods.2.list",
    "section": "Methods",
    "label": "Method group 2 — one technique per line",
    "selector": ".method-list > div:nth-child(2) ul",
    "kind": "list"
  },
  {
    "key": "methods.3.title",
    "section": "Methods",
    "label": "Method group 3 — title",
    "selector": ".method-list > div:nth-child(3) h3",
    "kind": "text"
  },
  {
    "key": "methods.3.list",
    "section": "Methods",
    "label": "Method group 3 — one technique per line",
    "selector": ".method-list > div:nth-child(3) ul",
    "kind": "list"
  },
  {
    "key": "publications.heading",
    "section": "Publications",
    "label": "Publications heading",
    "selector": "#publications-title",
    "kind": "text"
  },
  {
    "key": "publications.note",
    "section": "Publications",
    "label": "Note below publications",
    "selector": ".publications-bottom > span",
    "kind": "long"
  },
  {
    "key": "background.heading",
    "section": "Background",
    "label": "Background heading",
    "selector": "#background-title",
    "kind": "heading"
  },
  {
    "key": "background.intro",
    "section": "Background",
    "label": "Background introduction",
    "selector": "#background .section-aside",
    "kind": "long"
  },
  {
    "key": "experience.1.date",
    "section": "Background",
    "label": "Experience 1 — Dates",
    "selector": ".timeline li:nth-child(1) .timeline-date",
    "kind": "text"
  },
  {
    "key": "experience.1.role",
    "section": "Background",
    "label": "Experience 1 — Role",
    "selector": ".timeline li:nth-child(1) h4",
    "kind": "text"
  },
  {
    "key": "experience.1.place",
    "section": "Background",
    "label": "Experience 1 — Institution",
    "selector": ".timeline li:nth-child(1) .timeline-place",
    "kind": "text"
  },
  {
    "key": "experience.1.description",
    "section": "Background",
    "label": "Experience 1 — Description",
    "selector": ".timeline li:nth-child(1) p:not([class])",
    "kind": "long"
  },
  {
    "key": "experience.2.date",
    "section": "Background",
    "label": "Experience 2 — Dates",
    "selector": ".timeline li:nth-child(2) .timeline-date",
    "kind": "text"
  },
  {
    "key": "experience.2.role",
    "section": "Background",
    "label": "Experience 2 — Role",
    "selector": ".timeline li:nth-child(2) h4",
    "kind": "text"
  },
  {
    "key": "experience.2.place",
    "section": "Background",
    "label": "Experience 2 — Institution",
    "selector": ".timeline li:nth-child(2) .timeline-place",
    "kind": "text"
  },
  {
    "key": "experience.2.description",
    "section": "Background",
    "label": "Experience 2 — Description",
    "selector": ".timeline li:nth-child(2) p:not([class])",
    "kind": "long"
  },
  {
    "key": "experience.3.date",
    "section": "Background",
    "label": "Experience 3 — Dates",
    "selector": ".timeline li:nth-child(3) .timeline-date",
    "kind": "text"
  },
  {
    "key": "experience.3.role",
    "section": "Background",
    "label": "Experience 3 — Role",
    "selector": ".timeline li:nth-child(3) h4",
    "kind": "text"
  },
  {
    "key": "experience.3.place",
    "section": "Background",
    "label": "Experience 3 — Institution",
    "selector": ".timeline li:nth-child(3) .timeline-place",
    "kind": "text"
  },
  {
    "key": "experience.3.description",
    "section": "Background",
    "label": "Experience 3 — Description",
    "selector": ".timeline li:nth-child(3) p:not([class])",
    "kind": "long"
  },
  {
    "key": "education.1.date",
    "section": "Background",
    "label": "Education 1 — Dates",
    "selector": ".education-panel > div:nth-of-type(1) .timeline-date",
    "kind": "text"
  },
  {
    "key": "education.1.degree",
    "section": "Background",
    "label": "Education 1 — Degree",
    "selector": ".education-panel > div:nth-of-type(1) h4",
    "kind": "text"
  },
  {
    "key": "education.1.place",
    "section": "Background",
    "label": "Education 1 — Institution",
    "selector": ".education-panel > div:nth-of-type(1) p:not([class])",
    "kind": "text"
  },
  {
    "key": "education.2.date",
    "section": "Background",
    "label": "Education 2 — Dates",
    "selector": ".education-panel > div:nth-of-type(2) .timeline-date",
    "kind": "text"
  },
  {
    "key": "education.2.degree",
    "section": "Background",
    "label": "Education 2 — Degree",
    "selector": ".education-panel > div:nth-of-type(2) h4",
    "kind": "text"
  },
  {
    "key": "education.2.place",
    "section": "Background",
    "label": "Education 2 — Institution",
    "selector": ".education-panel > div:nth-of-type(2) p:not([class])",
    "kind": "text"
  },
  {
    "key": "education.3.date",
    "section": "Background",
    "label": "Education 3 — Dates",
    "selector": ".education-panel > div:nth-of-type(3) .timeline-date",
    "kind": "text"
  },
  {
    "key": "education.3.degree",
    "section": "Background",
    "label": "Education 3 — Degree",
    "selector": ".education-panel > div:nth-of-type(3) h4",
    "kind": "text"
  },
  {
    "key": "education.3.place",
    "section": "Background",
    "label": "Education 3 — Institution",
    "selector": ".education-panel > div:nth-of-type(3) p:not([class])",
    "kind": "text"
  },
  {
    "key": "background.interests",
    "section": "Background",
    "label": "Interests outside the lab",
    "selector": ".beyond-lab p",
    "kind": "heading"
  },
  {
    "key": "communications.heading",
    "section": "Talks & posters",
    "label": "Talks and posters heading",
    "selector": "#communications-title",
    "kind": "heading"
  },
  {
    "key": "communication.1.date",
    "section": "Talks & posters",
    "label": "Communication 1 — Date and type",
    "selector": ".communication-list article:nth-child(1) .timeline-date",
    "kind": "text"
  },
  {
    "key": "communication.1.title",
    "section": "Talks & posters",
    "label": "Communication 1 — Title",
    "selector": ".communication-list article:nth-child(1) h3 a",
    "kind": "text"
  },
  {
    "key": "communication.1.url",
    "section": "Talks & posters",
    "label": "Communication 1 — Link",
    "selector": ".communication-list article:nth-child(1) h3 a",
    "kind": "link"
  },
  {
    "key": "communication.1.description",
    "section": "Talks & posters",
    "label": "Communication 1 — Authors and venue",
    "selector": ".communication-list article:nth-child(1) p:not([class])",
    "kind": "long"
  },
  {
    "key": "communication.2.date",
    "section": "Talks & posters",
    "label": "Communication 2 — Date and type",
    "selector": ".communication-list article:nth-child(2) .timeline-date",
    "kind": "text"
  },
  {
    "key": "communication.2.title",
    "section": "Talks & posters",
    "label": "Communication 2 — Title",
    "selector": ".communication-list article:nth-child(2) h3 a",
    "kind": "text"
  },
  {
    "key": "communication.2.url",
    "section": "Talks & posters",
    "label": "Communication 2 — Link",
    "selector": ".communication-list article:nth-child(2) h3 a",
    "kind": "link"
  },
  {
    "key": "communication.2.description",
    "section": "Talks & posters",
    "label": "Communication 2 — Authors and venue",
    "selector": ".communication-list article:nth-child(2) p:not([class])",
    "kind": "long"
  },
  {
    "key": "contact.heading",
    "section": "Contact",
    "label": "Contact heading",
    "selector": "#contact-title",
    "kind": "heading"
  },
  {
    "key": "contact.intro",
    "section": "Contact",
    "label": "Contact introduction",
    "selector": ".contact-grid > div:first-child > p:not(.eyebrow)",
    "kind": "long"
  },
  {
    "key": "contact.email",
    "section": "Contact",
    "label": "Email address",
    "selector": ".email-link",
    "kind": "text"
  },
  {
    "key": "contact.location",
    "section": "Contact",
    "label": "Contact affiliation and location",
    "selector": ".contact-location",
    "kind": "heading"
  },
  {
    "key": "contact.profile1",
    "section": "Contact",
    "label": "Google Scholar URL",
    "selector": ".profile-links a:nth-child(1)",
    "kind": "link"
  },
  {
    "key": "contact.profile2",
    "section": "Contact",
    "label": "ResearchGate URL",
    "selector": ".profile-links a:nth-child(2)",
    "kind": "link"
  },
  {
    "key": "contact.profile3",
    "section": "Contact",
    "label": "ORCID URL",
    "selector": ".profile-links a:nth-child(3)",
    "kind": "link"
  },
  {
    "key": "contact.profile4",
    "section": "Contact",
    "label": "LinkedIn URL",
    "selector": ".profile-links a:nth-child(4)",
    "kind": "link"
  }
];
