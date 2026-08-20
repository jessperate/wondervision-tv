export type TvProgram = {
  number: string;
  eyebrow: string;
  title: string;
  tagline: string;
  action: string;
  palette: [string, string, string];
};

export const TV_PROGRAMS: TvProgram[] = [
  {
    number: "05",
    eyebrow: "NOW BROADCASTING",
    title: "Wondervision",
    tagline: "Stories from a brighter tomorrow.",
    action: "ENTER THE PICTURE",
    palette: ["#071f25", "#156060", "#ef785b"],
  },
  {
    number: "08",
    eyebrow: "TONIGHT AT EIGHT",
    title: "Midnight Movie",
    tagline: "A strange transmission from somewhere beyond.",
    action: "WATCH THE TRAILER",
    palette: ["#161427", "#512f50", "#e7a958"],
  },
  {
    number: "13",
    eyebrow: "SPECIAL PRESENTATION",
    title: "Please Stand By",
    tagline: "Wondervision will return after this brief intermission.",
    action: "VIEW THE SCHEDULE",
    palette: ["#102d31", "#1c6361", "#dc9c4a"],
  },
];
