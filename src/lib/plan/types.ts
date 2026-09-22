export const goals = [
  { id: "recovery", label: "Recovery", blurb: "Bounce back from training and get back to full strength." },
  { id: "fat-loss", label: "Lose fat", blurb: "Steady fat loss that keeps muscle, not a crash diet." },
  { id: "muscle", label: "Build muscle", blurb: "Gain strength and size with training, food, and sleep lined up." },
  { id: "skin", label: "Skin and hair", blurb: "Skin, hair, and how you look and feel day to day." },
  { id: "sleep", label: "Sleep better", blurb: "Fall asleep easier and wake up rested." },
  { id: "cognition", label: "Focus and mood", blurb: "Clearer thinking, steadier energy, less stress." },
  { id: "longevity", label: "Healthy ageing", blurb: "Energy, metabolism, and long-term health." },
  { id: "libido", label: "Sexual health", blurb: "Libido and sexual wellbeing." },
] as const

export type GoalId = (typeof goals)[number]["id"];
