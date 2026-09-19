/**
 * Single source of truth for FAQ content.
 *
 * Used by the homepage FAQ section, the /faq page, and the FAQPage JSON-LD.
 * Keep every answer factual and limited to behaviour that actually exists in
 * the product (upload photos, AI analyses/organises/curates/describes them,
 * cinematic album, free tier: 100 images / 2 trips, Google or email sign-in).
 */
export interface FaqItem {
  question: string;
  /** Plain-text answer (also emitted verbatim into JSON-LD). */
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is VoyaLoom?",
    answer:
      "VoyaLoom is an AI travel album generator. You upload the photos from a trip and VoyaLoom uses AI to analyze the images, understand the moments, organize and curate the strongest shots, add contextual descriptions and fitting quotes, and present everything as a cinematic travel album.",
  },
  {
    question: "Does VoyaLoom generate AI images?",
    answer:
      "No. VoyaLoom works with the real photos you upload. The AI is used to understand, organize, curate, describe, and present your photos — it does not create or replace your travel images.",
  },
  {
    question: "How does VoyaLoom create a travel album?",
    answer:
      "Create a trip, upload your travel photos, and VoyaLoom analyzes the images, groups related moments, selects the most meaningful photos, writes contextual descriptions, adds suitable quotes, and arranges everything into a scrollable cinematic album you can revisit and share.",
  },
  {
    question: "Do I need to manually pick the best photos?",
    answer:
      "No. VoyaLoom curates the collection for you — it identifies meaningful moments and surfaces the strongest images so you don't have to sort hundreds of photos by hand. Your full upload stays in the album archive.",
  },
  {
    question: "Can VoyaLoom add descriptions to my travel album?",
    answer:
      "Yes. VoyaLoom generates contextual descriptions for the moments in your trip and adds suitable quotes where they fit, so the album reads as a story instead of a plain photo grid.",
  },
  {
    question: "How many photos can I upload?",
    answer: "VoyaLoom is currently free with a limit of up to 100 images per account.",
  },
  {
    question: "How many trips can I create?",
    answer: "You can currently create up to 2 trips per account while VoyaLoom is free.",
  },
  {
    question: "Is VoyaLoom free?",
    answer:
      "Yes. VoyaLoom is currently free to use, with limits of up to 100 images and up to 2 trips per account. There are no paid plans at this time.",
  },
  {
    question: "What kind of photos work best?",
    answer:
      "Regular travel and vacation photos work well — landscapes, streets, food, people, and moments from your trip. VoyaLoom accepts JPEG, PNG, GIF, and HEIC images (including straight from an iPhone).",
  },
  {
    question: "Can I use VoyaLoom for vacation photos?",
    answer:
      "Yes. VoyaLoom is built for any trip — vacations, road trips, backpacking, honeymoons, family holidays, or a weekend away. If you came home with a full camera roll, VoyaLoom turns it into an album.",
  },
  {
    question: "How do I sign in?",
    answer:
      "You can create a VoyaLoom account with your email and a password, or continue with Google.",
  },
  {
    question: "What does VoyaLoom do with my uploaded photos?",
    answer:
      "Your uploaded photos are stored so VoyaLoom can build and display your album, and they are processed by AI to analyze scenes, organize moments, and generate descriptions. Your photos are used to create your album, not to replace it.",
  },
];
