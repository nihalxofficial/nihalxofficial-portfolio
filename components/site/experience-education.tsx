import { JourneyTimeline } from "@/components/site/journey";
import { EducationCards } from "@/components/site/education";
import type { Education as EducationEntry, Experience, SectionMeta } from "@/lib/types";

/**
 * Experience + Education, side by side — one section, two columns.
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

  const twoColumns = showJourney && showEducation;
  const sectionId  = showJourney ? "journey" : "education";

  return (
    <section id={sectionId} className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my journey"}</p>
      <h2 className="text-3xl font-bold mb-8">
        Experience <span className="text-grad">Timeline</span>
      </h2>

      <div className={`grid gap-12 lg:gap-10 ${twoColumns ? "lg:grid-cols-2" : ""}`}>
        {showJourney && (
          <div id={showJourney ? "journey" : undefined} className="flex h-full flex-col scroll-mt-24">
            <h3 className="font-mono text-sm text-acc mb-1">
              {journeySection?.label || "// experience"}
            </h3>
            <p className="text-xl font-bold mb-4">
              {journeySection?.heading || "Work History"}
            </p>
            <JourneyTimeline experience={experience} />
          </div>
        )}

        {showEducation && (
          <div id={showJourney ? "education" : undefined} className="flex h-full flex-col scroll-mt-24">
            <h3 className="font-mono text-sm text-acc mb-1">
              {educationSection?.label || "// education"}
            </h3>
            <p className="text-xl font-bold mb-4">
              {educationSection?.heading || "Academic Background"}
            </p>
            <EducationCards education={education} />
          </div>
        )}
      </div>
    </section>
  );
}
