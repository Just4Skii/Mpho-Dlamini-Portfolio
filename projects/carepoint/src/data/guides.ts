export interface GuideSection {
  heading: string;
  body: string;
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  intro: string;
  minutes: number;
  tag: string;
  image: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: "prepare-for-an-appointment",
    title: "How to prepare for an appointment",
    intro:
      "A little preparation turns a rushed ten minutes into a genuinely useful consultation. Here is how to make the most of any appointment.",
    minutes: 4,
    tag: "Appointments",
    image: "notes",
    sections: [
      {
        heading: "Write down what you want to cover",
        body: "It is easy to forget your main concern once you are in the room. Before the appointment, jot down your two or three most important points, starting with the one that worries you most.",
        list: [
          "When the problem started and how it has changed",
          "Anything that makes it better or worse",
          "Medication or remedies you already take",
        ],
      },
      {
        heading: "Bring the right information",
        body: "If you have recent test results, a referral letter or a list of current medication, bring them along — photos on your phone are usually fine for a first consultation.",
      },
      {
        heading: "Arrive a few minutes early",
        body: "First visits often include administrative steps: confirming your details, medical aid information and consent. Arriving ten minutes early keeps the consultation time for what matters.",
      },
      {
        heading: "Agree on the next step before you leave",
        body: "A good consultation ends with a clear plan. If you are unsure about anything — medication timing, when to come back, what to watch for — ask before you leave the room.",
      },
    ],
  },
  {
    slug: "questions-to-ask-a-new-gp",
    title: "Questions to ask a new GP",
    intro:
      "Choosing a GP is a relationship decision as much as a practical one. These questions help you find a good fit early.",
    minutes: 3,
    tag: "Primary care",
    image: "hero",
    sections: [
      {
        heading: "About how the practice works",
        body: "Understanding the logistics up front avoids surprises later.",
        list: [
          "What are the consultation fees, and do you have medical aid rates?",
          "How do repeat prescriptions work?",
          "Who do I see when you are unavailable?",
          "Is there after-hours or telephone advice?",
        ],
      },
      {
        heading: "About your care",
        body: "A good GP will welcome questions about how they practise.",
        list: [
          "How do you handle referrals to specialists?",
          "Do you coordinate care if I see other providers?",
          "How are test results communicated?",
        ],
      },
      {
        heading: "Trust your comfort level",
        body: "You should leave feeling heard. If a consultation feels rushed or dismissive, it is reasonable to try another provider — continuity matters, but so does confidence in the person caring for you.",
      },
    ],
  },
  {
    slug: "understanding-specialties",
    title: "Understanding different healthcare specialties",
    intro:
      "GP or specialist? Physio or OT? A quick orientation to who does what in South African healthcare.",
    minutes: 5,
    tag: "Navigating care",
    image: "clinic",
    sections: [
      {
        heading: "Start with a GP when unsure",
        body: "General Practitioners are trained to assess undiagnosed problems and route you correctly. In many medical aid schemes, seeing your GP first also keeps costs under control.",
      },
      {
        heading: "Medical specialists",
        body: "Dermatologists, psychiatrists and paediatricians have advanced training in one area. You can usually book directly, though some specialists prefer a GP referral letter for context.",
      },
      {
        heading: "Allied health professionals",
        body: "Physiotherapists, occupational therapists, dietitians, psychologists and optometrists are registered professionals who work independently of doctors for many conditions.",
        list: [
          "Physiotherapist — movement, pain and rehabilitation",
          "Occupational therapist — daily function, home and work adaptations",
          "Dietitian — medical and practical nutrition",
          "Psychologist — talk-based therapy and assessment",
          "Optometrist — vision and eye health screening",
        ],
      },
      {
        heading: "When to skip the queue",
        body: "Some problems need urgent attention rather than the right specialist — chest pain, difficulty breathing, severe bleeding or any situation that feels life-threatening should go straight to emergency services.",
      },
    ],
  },
  {
    slug: "what-to-bring",
    title: "What to bring to an appointment",
    intro: "A short checklist that makes first consultations smoother — for you and for the provider.",
    minutes: 2,
    tag: "Appointments",
    image: "reception",
    sections: [
      {
        heading: "The essentials",
        body: "Most practices only need a few things to get you booked in.",
        list: [
          "Medical aid card or membership details, if you have one",
          "A list of current medication with dosages",
          "Any referral letter or previous test results",
          "Comfortable clothing for examinations or physio sessions",
        ],
      },
      {
        heading: "For children's appointments",
        body: "Bring the Road to Health booklet for babies and young children — it holds vaccination and growth records that are genuinely useful to the provider.",
      },
      {
        heading: "What you do not need to bring",
        body: "You should not be asked for your full medical history file at a first private consultation. A summary from your GP is usually sufficient.",
      },
    ],
  },
  {
    slug: "finding-care-near-you",
    title: "How to find care near you",
    intro: "Location, availability and cost are the three practical filters. Here is a sensible order to apply them.",
    minutes: 3,
    tag: "Navigating care",
    image: "physio",
    sections: [
      {
        heading: "Filter by the right specialty first",
        body: "Start with what you need — a GP for general concerns, or a specific professional if you already know the type of care. Specialty pages on CarePoint explain what each profession handles.",
      },
      {
        heading: "Then narrow by area and availability",
        body: "Care you can actually reach and actually get into beats the perfect provider on paper. Use the location and availability filters together — 'tomorrow' often opens up nearby options you would otherwise miss.",
      },
      {
        heading: "Compare the shortlist calmly",
        body: "Two or three options is enough. Compare consultation fees, medical aid status, languages spoken and the next available slot — then book the one that fits. You can always build a longer relationship from a first appointment.",
      },
    ],
  },
];

export function getGuide(slug: string | undefined | null): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
