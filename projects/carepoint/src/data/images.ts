export const IMAGES = {
  hero: "https://image.qwenlm.ai/generated-images/2eac0482-a577-4a46-864d-ce3d31da90d9/_result.png",
  clinic: "https://image.qwenlm.ai/generated-images/9ea8d571-2b47-4a63-9dd9-d99693f77aa7/_result.png",
  physio: "https://image.qwenlm.ai/generated-images/e7b8afb5-8e4c-432a-85fd-2c08bab53a72/_result.png",
  reception: "https://image.qwenlm.ai/generated-images/6681fb4c-ccfb-42ba-ad59-ac086fbf75c0/_result.png",
  night: "https://image.qwenlm.ai/generated-images/9bae815e-1c20-4bd9-9fe8-340849e4611c/_result.png",
  notes: "https://image.qwenlm.ai/generated-images/55964325-5ad8-4e88-bba8-ee449a476cbc/_result.png",
} as const;

export type ImageKey = keyof typeof IMAGES;
