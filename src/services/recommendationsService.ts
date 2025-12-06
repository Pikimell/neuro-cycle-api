import { getLatestMoodEntry } from "./moodEntriesService.js";
import type { PatientDocument } from "../database/models/patients.js";

export type Recommendation = {
  title: string;
  description: string;
  type: "GENERAL" | "MOOD" | "QUESTIONNAIRE" | "REMINDER";
};

export const getRecommendationsForPatient = async (patient: PatientDocument): Promise<Recommendation[]> => {
  const latestMood = await getLatestMoodEntry(patient._id.toString());

  const common: Recommendation[] = [
    {
      title: "Регулярний сон",
      description: "Спробуйте лягати та прокидатися в один і той самий час у вашому часовому поясі.",
      type: "GENERAL",
    },
  ];

  if (patient.diagnosisType && patient.diagnosisType !== "NONE") {
    return [
      ...common,
      {
        title: "Опитування за діагнозом",
        description: "Пройдіть рекомендовані опитування для вашого стану у відповідному розділі.",
        type: "QUESTIONNAIRE",
      },
    ];
  }

  if (latestMood && typeof latestMood.moodScore === "number") {
    if (latestMood.moodScore <= 3) {
      return [
        {
          title: "Підтримка при низькому настрої",
          description: "Зробіть коротку перерву та практикуйте дихальні вправи 5 хвилин.",
          type: "MOOD",
        },
        ...common,
      ];
    }
    if (latestMood.moodScore >= 7) {
      return [
        {
          title: "Закріпіть позитив",
          description: "Запишіть, що допомогло гарному настрою, щоб повторювати це частіше.",
          type: "MOOD",
        },
        ...common,
      ];
    }
  }

  return common;
};
