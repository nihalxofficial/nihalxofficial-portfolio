import { JourneySection } from "@/components/site/journey";
import type { Education as EducationEntry, Experience, SectionMeta } from "@/lib/types";

/**
 * Experience + Education — rendered as a unified reference-style timeline
 * with Heatmap, filter chips, repo stats and legend.
 */
export function ExperienceEducation({
  experience,
  education,
  journeySection,
  educationSection,
  journeyIndex,
  educationIndex,
}: {
  experience: Experience[];
  education: EducationEntry[];
  journeySection?: SectionMeta;
  educationSection?: SectionMeta;
  journeyIndex: number;
  educationIndex: number;
}) {
  const showJourney   = experience.length > 0;
  const showEducation = education.length > 0;

  if (!showJourney && !showEducation) return null;

  return (
    <JourneySection experience={experience} education={education} />
  );
}
