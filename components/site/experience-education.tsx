import { JourneyTimeline } from "@/components/site/journey";
import { EducationCards } from "@/components/site/education";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Education as EducationEntry, Experience, SectionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Experience + Education, side by side — one section, two columns.
 *
 * Both halves keep their own heading and their own anchor, so the nav pill and
 * the mobile dock still highlight them separately. Whichever side has no data
 * (or is hidden in the dashboard) simply gives its width to the other.
 *
 * The grid stretches by default, so both columns end on the same line: the
 * shorter one grows its cards instead of leaving a ragged edge.
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
  const showJourney = experience.length > 0;
  const showEducation = education.length > 0;

  if (!showJourney && !showEducation) return null;

  const twoColumns = showJourney && showEducation;
  // The section element holds the first anchor that exists; the second one is
  // put on the column itself, so a link to either still lands correctly.
  const sectionId = showJourney ? "journey" : "education";

  return (
    <section id={sectionId} className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <div
          className={cn(
            "grid gap-12 lg:gap-10",
            twoColumns ? "lg:grid-cols-2" : "lg:grid-cols-1",
          )}
        >
          {showJourney ? (
            <div className="flex h-full flex-col">
              <Reveal>
                <SectionHeading
                  index={journeyIndex}
                  label={journeySection?.label || "Experience"}
                  title={journeySection?.heading || "My Journey"}
                  description={
                    journeySection?.description ||
                    "Where I have worked, what I shipped there and what I am working on now."
                  }
                />
              </Reveal>

              <JourneyTimeline experience={experience} />
            </div>
          ) : null}

          {showEducation ? (
            <div
              id={showJourney ? "education" : undefined}
              className="flex h-full scroll-mt-24 flex-col"
            >
              <Reveal>
                <SectionHeading
                  index={educationIndex}
                  label={educationSection?.label || "Education"}
                  title={educationSection?.heading || "Academic Background"}
                  description={
                    educationSection?.description ||
                    "The formal side of the journey — everything else I picked up by building."
                  }
                />
              </Reveal>

              <EducationCards education={education} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
