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
  showJourney,
  showEducation,
}: {
  experience: Experience[];
  education: EducationEntry[];
  journeySection?: SectionMeta;
  educationSection?: SectionMeta;
  journeyIndex: number;
  educationIndex: number;
  /** CMS section toggles; default to on so a missing section row never hides data. */
  showJourney?: boolean;
  showEducation?: boolean;
}) {
  // A disabled section drops its records from the unified timeline while the
  // other half keeps rendering. Both off (or no data) renders nothing.
  const journeys = showJourney === false ? [] : experience;
  const studies = showEducation === false ? [] : education;

  if (journeys.length === 0 && studies.length === 0) return null;

  return (
    <JourneySection experience={journeys} education={studies} />
  );
}
